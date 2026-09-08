const Inspection = require('../models/Inspection');
const Contract = require('../models/Contract');
const Crop = require('../models/Crop');
const Notification = require('../models/Notification');

// @desc    Create new field inspection report
// @route   POST /api/inspections
// @access  Private (Officer, Admin)
const createInspection = async (req, res, next) => {
  try {
    const {
      contractId,
      farmId,
      cropCondition,
      growthPercentage,
      pestOrDiseaseDetected,
      pestDiseaseDetails,
      soilMoistureCondition,
      irrigationStatus,
      remarks,
      recommendedActions,
      photos,
      overallScore,
    } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    const inspection = await Inspection.create({
      contract: contractId,
      farm: farmId,
      officer: req.user.id,
      cropCondition,
      growthPercentage: Number(growthPercentage),
      pestOrDiseaseDetected: !!pestOrDiseaseDetected,
      pestDiseaseDetails: pestDiseaseDetails || '',
      soilMoistureCondition,
      irrigationStatus,
      remarks,
      recommendedActions: recommendedActions || '',
      photos: photos || [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60',
      ],
      overallScore: overallScore ? Number(overallScore) : 88,
    });

    // Update associated Crop health & growth
    const crop = await Crop.findOne({ contract: contractId });
    if (crop) {
      crop.growthPercentage = Math.max(crop.growthPercentage, Number(growthPercentage));
      if (cropCondition === 'Damaged' || cropCondition === 'Severe Pest Infection') {
        crop.healthStatus = 'Pest Risk';
      } else if (cropCondition === 'Excellent') {
        crop.healthStatus = 'Excellent';
      } else {
        crop.healthStatus = 'Good';
      }
      crop.stageHistory.push({
        stage: crop.stage,
        updatedDate: new Date(),
        notes: `Field Inspection by ${req.user.name}: ${remarks}`,
        growthPercentage: crop.growthPercentage,
      });
      await crop.save();
    }

    // Notify Farmer
    if (contract.assignedFarmer) {
      await Notification.create({
        recipient: contract.assignedFarmer,
        title: 'New Field Inspection Filed',
        message: `Field Officer ${req.user.name} completed an inspection for your ${contract.cropName} crop (Health Score: ${overallScore || 88}/100).`,
        type: 'inspection',
        link: `/farmer/inspections`,
      });
    }

    // Notify Buyer
    if (contract.buyer) {
      await Notification.create({
        recipient: contract.buyer,
        title: 'Crop Inspection Report Available',
        message: `Officer inspection submitted for Contract ${contract.contractCode}. Crop condition: ${cropCondition}.`,
        type: 'inspection',
        link: `/buyer/monitoring`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Field inspection submitted successfully',
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inspections for a contract
// @route   GET /api/inspections/contract/:contractId
// @access  Private
const getInspectionsByContract = async (req, res, next) => {
  try {
    const inspections = await Inspection.find({ contract: req.params.contractId })
      .populate('officer', 'name email phone officerDetails')
      .populate('farm')
      .sort({ inspectionDate: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inspections filed by or assigned to the officer
// @route   GET /api/inspections/my-inspections
// @access  Private (Officer)
const getMyInspections = async (req, res, next) => {
  try {
    const inspections = await Inspection.find({ officer: req.user.id })
      .populate({
        path: 'contract',
        populate: [
          { path: 'buyer', select: 'name email phone' },
          { path: 'assignedFarmer', select: 'name email phone' },
        ],
      })
      .populate('farm')
      .sort({ inspectionDate: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inspections (Admin / All)
// @route   GET /api/inspections
// @access  Private
const getAllInspections = async (req, res, next) => {
  try {
    const inspections = await Inspection.find()
      .populate('contract')
      .populate('farm')
      .populate('officer', 'name officerDetails')
      .sort({ inspectionDate: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInspection,
  getInspectionsByContract,
  getMyInspections,
  getAllInspections,
};
