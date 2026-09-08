const User = require('../models/User');
const Contract = require('../models/Contract');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const QualityCheck = require('../models/QualityCheck');

// @desc    Get system-wide overview and metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getPlatformStats = async (req, res, next) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });
    const totalContracts = await Contract.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: 'in_progress' });
    const completedContracts = await Contract.countDocuments({ status: 'completed' });
    const totalFarms = await Farm.countDocuments();
    const activeCrops = await Crop.countDocuments({ stage: { $ne: 'Harvested' } });
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'under_investigation'] } });

    const payments = await Payment.find({ status: 'completed' });
    const totalVolume = payments.reduce((acc, p) => acc + (p.netAmount || 0), 0);

    const pendingEscrowPayments = await Payment.find({ status: 'escrow_held' });
    const totalEscrowHeld = pendingEscrowPayments.reduce((acc, p) => acc + (p.netAmount || 0), 0);

    // Calculate total cultivated acreage
    const farms = await Farm.find({}, 'areaInAcres');
    const totalAcreage = farms.reduce((acc, f) => acc + (f.areaInAcres || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalBuyers,
        totalOfficers,
        totalContracts,
        activeContracts,
        completedContracts,
        totalFarms,
        totalAcreage,
        activeCrops,
        openComplaints,
        totalVolume,
        totalEscrowHeld,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (verify, block, activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (status) user.status = status;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status} (Verified: ${user.isVerified})`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin' && user.email === 'admin@agriflow.com') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove primary root administrator account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visual analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    // Crop breakdown
    const cropAggregation = await Contract.aggregate([
      { $group: { _id: '$cropName', count: { $sum: 1 }, totalQty: { $sum: '$targetQuantity' }, totalValue: { $sum: '$totalEstimatedValue' } } },
      { $sort: { totalValue: -1 } },
      { $limit: 6 }
    ]);

    // Monthly contracts trend mock / realistic rollup
    const monthlyTrends = [
      { month: 'Oct', contracts: 8, volumeLakhs: 24.5 },
      { month: 'Nov', contracts: 14, volumeLakhs: 42.0 },
      { month: 'Dec', contracts: 19, volumeLakhs: 68.2 },
      { month: 'Jan', contracts: 26, volumeLakhs: 91.5 },
      { month: 'Feb', contracts: 34, volumeLakhs: 118.0 },
      { month: 'Mar', contracts: 45, volumeLakhs: 165.4 },
    ];

    res.status(200).json({
      success: true,
      cropAggregation,
      monthlyTrends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
};
