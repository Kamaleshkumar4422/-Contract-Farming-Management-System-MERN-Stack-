const QualityCheck = require('../models/QualityCheck');
const Contract = require('../models/Contract');
const Crop = require('../models/Crop');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Helper to generate QC certificate number
const generateCertificateNumber = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `QC-CERT-${new Date().getFullYear()}-${rand}`;
};

// @desc    Conduct and submit quality check for harvest
// @route   POST /api/quality
// @access  Private (Buyer, Admin)
const createQualityCheck = async (req, res, next) => {
  try {
    const {
      contractId,
      cropId,
      suppliedQuantityInQuintals,
      moistureLevelPercentage,
      foreignMatterPercentage,
      grainSizeUniformityPercentage,
      qualityGrade,
      qualityScore,
      status,
      remarks,
    } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    const certificateNumber = generateCertificateNumber();

    const qualityCheck = await QualityCheck.create({
      contract: contractId,
      crop: cropId,
      buyer: req.user.id,
      farmer: contract.assignedFarmer,
      suppliedQuantityInQuintals: Number(suppliedQuantityInQuintals),
      moistureLevelPercentage: Number(moistureLevelPercentage),
      foreignMatterPercentage: foreignMatterPercentage !== undefined ? Number(foreignMatterPercentage) : 0.5,
      grainSizeUniformityPercentage: grainSizeUniformityPercentage !== undefined ? Number(grainSizeUniformityPercentage) : 95,
      qualityGrade,
      qualityScore: Number(qualityScore),
      status: status || 'Approved',
      certificateNumber,
      certifiedBy: `${req.user.name} (Quality Assessment Officer)`,
      remarks: remarks || 'Batch meets acceptable procurement criteria.',
    });

    // If approved, create automated delivery payment record ready for disbursement
    if (status === 'Approved') {
      const pricePerUnit = contract.pricePerUnit;
      const grossAmount = Number(suppliedQuantityInQuintals) * pricePerUnit;
      // Subtract advance if already factored
      const advanceAmount = (contract.advancePaymentPercentage / 100) * grossAmount;
      const netAmount = grossAmount - advanceAmount;

      const randTxn = Math.floor(100000 + Math.random() * 900000);
      await Payment.create({
        contract: contract._id,
        buyer: req.user.id,
        farmer: contract.assignedFarmer,
        transactionId: `TXN-AGRI-${randTxn}`,
        milestoneType: 'Harvest Delivery',
        quantitySuppliedInQuintals: Number(suppliedQuantityInQuintals),
        pricePerUnit,
        grossAmount,
        deductions: advanceAmount,
        netAmount,
        paymentMethod: 'Platform Escrow Release',
        status: 'escrow_held',
        receiptNumber: `REC-${randTxn}`,
        notes: `Automated escrow allocation generated upon Quality Grade ${qualityGrade} sign-off.`,
      });

      // Update contract status to completed or ready for payment
      contract.status = 'completed';
      await contract.save();
    }

    // Notify Farmer
    if (contract.assignedFarmer) {
      await Notification.create({
        recipient: contract.assignedFarmer,
        title: `Quality Check Completed: ${status}`,
        message: `Your harvest for contract ${contract.contractCode} was graded ${qualityGrade} (Score: ${qualityScore}/100). Status: ${status}.`,
        type: 'quality',
        link: `/farmer/payments`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quality check completed and certificate issued',
      qualityCheck,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quality check records for a contract
// @route   GET /api/quality/contract/:contractId
// @access  Private
const getQualityChecksByContract = async (req, res, next) => {
  try {
    const records = await QualityCheck.find({ contract: req.params.contractId })
      .populate('buyer', 'name email buyerDetails')
      .populate('farmer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quality checks for logged-in farmer
// @route   GET /api/quality/my-checks
// @access  Private (Farmer)
const getQualityChecksByFarmer = async (req, res, next) => {
  try {
    const records = await QualityCheck.find({ farmer: req.user.id })
      .populate('contract')
      .populate('buyer', 'name buyerDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quality checks (Admin / Buyer)
// @route   GET /api/quality
// @access  Private (Admin, Buyer)
const getAllQualityChecks = async (req, res, next) => {
  try {
    const records = await QualityCheck.find()
      .populate('contract')
      .populate('farmer', 'name email phone')
      .populate('buyer', 'name buyerDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQualityCheck,
  getQualityChecksByContract,
  getQualityChecksByFarmer,
  getAllQualityChecks,
};
