const Farm = require('../models/Farm');

// @desc    Create a new farm profile
// @route   POST /api/farms
// @access  Private (Farmer)
const createFarm = async (req, res, next) => {
  try {
    const {
      farmName,
      surveyNumber,
      areaInAcres,
      soilType,
      irrigationSource,
      waterAvailability,
      location,
      currentCrops,
      organicCertified,
    } = req.body;

    const farm = await Farm.create({
      farmer: req.user.id,
      farmName,
      surveyNumber,
      areaInAcres,
      soilType,
      irrigationSource,
      waterAvailability,
      location: location || {
        village: 'Rampur',
        district: 'Nagpur',
        state: 'Maharashtra',
        latitude: 21.1458,
        longitude: 79.0882,
      },
      currentCrops: currentCrops || [],
      organicCertified: !!organicCertified,
    });

    res.status(201).json({
      success: true,
      message: 'Farm registered successfully',
      farm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all farms for the logged-in farmer
// @route   GET /api/farms/my-farms
// @access  Private (Farmer)
const getMyFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm by ID
// @route   GET /api/farms/:id
// @access  Private
const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('farmer', 'name email phone farmerDetails');
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    res.status(200).json({
      success: true,
      farm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private (Farmer)
const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    // Verify ownership or admin
    if (farm.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm record',
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      farm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private (Farmer)
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    if (farm.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm record',
      });
    }

    await farm.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Farm removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all farms in platform (for field officers / admins)
// @route   GET /api/farms
// @access  Private (Officer, Admin)
const getAllFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find()
      .populate('farmer', 'name email phone farmerDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFarm,
  getMyFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getAllFarms,
};
