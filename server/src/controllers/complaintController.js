const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Helper to generate complaint number
const generateComplaintNumber = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${new Date().getFullYear()}-${rand}`;
};

// @desc    Raise a new complaint / dispute
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { contractId, againstUserId, category, subject, description, priority } = req.body;

    const complaintNumber = generateComplaintNumber();

    const complaint = await Complaint.create({
      raisedBy: req.user.id,
      contract: contractId || null,
      againstUser: againstUserId || null,
      complaintNumber,
      category: category || 'Payment Dispute',
      subject,
      description,
      priority: priority || 'Medium',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted to platform arbitration desk',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints raised by logged-in user
// @route   GET /api/complaints/my-complaints
// @access  Private
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.user.id })
      .populate('contract')
      .populate('againstUser', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints across platform (Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('raisedBy', 'name email role phone')
      .populate('contract')
      .populate('againstUser', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to and resolve a complaint (Admin)
// @route   PUT /api/complaints/:id/respond
// @access  Private (Admin)
const respondToComplaint = async (req, res, next) => {
  try {
    const { adminResponse, status } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.adminResponse = adminResponse;
    complaint.status = status || 'resolved';
    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user.id;
    }
    await complaint.save();

    // Notify user who raised complaint
    await Notification.create({
      recipient: complaint.raisedBy,
      title: `Complaint ${complaint.complaintNumber} Update: ${status}`,
      message: `Admin responded: "${adminResponse.slice(0, 80)}..."`,
      type: 'complaint',
      link: `/complaints`,
    });

    res.status(200).json({
      success: true,
      message: 'Resolution posted successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  respondToComplaint,
};
