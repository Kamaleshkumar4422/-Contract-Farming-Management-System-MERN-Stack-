const Crop = require('../models/Crop');
const Notification = require('../models/Notification');
const Contract = require('../models/Contract');

// @desc    Get all crops for the logged-in farmer
// @route   GET /api/crops/my-crops
// @access  Private (Farmer)
const getFarmerCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id })
      .populate('contract')
      .populate('farm')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop tracking by contract ID
// @route   GET /api/crops/contract/:contractId
// @access  Private
const getCropByContract = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({ contract: req.params.contractId })
      .populate('contract')
      .populate('farm')
      .populate('farmer', 'name email phone');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'No crop tracking record found for this contract',
      });
    }

    res.status(200).json({
      success: true,
      crop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop stage and growth
// @route   PUT /api/crops/:id/stage
// @access  Private (Farmer, Officer)
const updateCropStage = async (req, res, next) => {
  try {
    const { stage, growthPercentage, healthStatus, notes, actualYieldInQuintals } = req.body;
    const crop = await Crop.findById(req.params.id).populate('contract');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found',
      });
    }

    if (stage) crop.stage = stage;
    if (growthPercentage !== undefined) crop.growthPercentage = Number(growthPercentage);
    if (healthStatus) crop.healthStatus = healthStatus;
    if (actualYieldInQuintals !== undefined) crop.actualYieldInQuintals = Number(actualYieldInQuintals);

    // Append stage history
    crop.stageHistory.push({
      stage: stage || crop.stage,
      updatedDate: new Date(),
      notes: notes || `Stage progress updated to ${stage || crop.stage} (${crop.growthPercentage}%)`,
      growthPercentage: crop.growthPercentage,
    });

    if (stage === 'Harvested') {
      crop.actualHarvestDate = new Date();
    }

    await crop.save();

    // If crop is harvested, notify Buyer for Quality Check
    if (stage === 'Harvested' && crop.contract && crop.contract.buyer) {
      await Notification.create({
        recipient: crop.contract.buyer,
        title: 'Crop Harvest Ready for Quality Verification',
        message: `Farmer ${req.user.name} reported crop harvest completed for contract ${crop.contract.contractCode}. Please proceed with quality check.`,
        type: 'quality',
        link: `/buyer/quality`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop progress updated successfully',
      crop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all crops (Admin / Buyer overview)
// @route   GET /api/crops
// @access  Private (Admin, Buyer, Officer)
const getAllCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find()
      .populate('contract')
      .populate('farm')
      .populate('farmer', 'name email phone')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarmerCrops,
  getCropByContract,
  updateCropStage,
  getAllCrops,
};
