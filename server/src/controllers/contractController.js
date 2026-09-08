const Contract = require('../models/Contract');
const Application = require('../models/Application');
const Crop = require('../models/Crop');
const Notification = require('../models/Notification');
const Farm = require('../models/Farm');

// Helper to generate contract code
const generateContractCode = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CFT-${new Date().getFullYear()}-${rand}`;
};

// @desc    Create a new farming contract
// @route   POST /api/contracts
// @access  Private (Buyer)
const createContract = async (req, res, next) => {
  try {
    const {
      title,
      cropName,
      variety,
      targetQuantity,
      minimumLandRequired,
      pricePerUnit,
      unit,
      sowingDate,
      expectedHarvestDate,
      deliveryLocation,
      qualityStandards,
      termsAndConditions,
      advancePaymentPercentage,
    } = req.body;

    const contractCode = generateContractCode();
    const totalEstimatedValue = Number(targetQuantity) * Number(pricePerUnit);

    // Build QR payload
    const qrCodeData = JSON.stringify({
      code: contractCode,
      crop: cropName,
      targetQuantity,
      pricePerUnit,
      buyer: req.user.name,
      verifiedAt: new Date().toISOString(),
    });

    const contract = await Contract.create({
      buyer: req.user.id,
      contractCode,
      title,
      cropName,
      variety: variety || 'Standard High-Yield Hybrid',
      targetQuantity,
      minimumLandRequired,
      pricePerUnit,
      unit: unit || 'Quintal',
      totalEstimatedValue,
      sowingDate,
      expectedHarvestDate,
      deliveryLocation,
      qualityStandards: qualityStandards || {
        minimumGrade: 'Grade A',
        maxMoisturePercentage: 12,
        allowedDefectsPercentage: 2,
        organicPreferred: false,
      },
      termsAndConditions,
      advancePaymentPercentage: advancePaymentPercentage || 20,
      status: 'open',
      qrCodeData,
    });

    res.status(201).json({
      success: true,
      message: 'Farming contract published successfully',
      contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contracts (with filtering)
// @route   GET /api/contracts
// @access  Public
const getAllContracts = async (req, res, next) => {
  try {
    const { cropName, status, buyerId, search } = req.query;
    let query = {};

    if (cropName) {
      query.cropName = { $regex: cropName, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (buyerId) {
      query.buyer = buyerId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { cropName: { $regex: search, $options: 'i' } },
        { deliveryLocation: { $regex: search, $options: 'i' } },
        { contractCode: { $regex: search, $options: 'i' } },
      ];
    }

    const contracts = await Contract.find(query)
      .populate('buyer', 'name email phone buyerDetails')
      .populate('assignedFarmer', 'name email phone')
      .populate('assignedFarm')
      .populate('assignedOfficer', 'name officerDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contracts.length,
      contracts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Public
const getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('buyer', 'name email phone buyerDetails')
      .populate('assignedFarmer', 'name email phone farmerDetails address')
      .populate('assignedFarm')
      .populate('assignedOfficer', 'name email phone officerDetails');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a contract
// @route   POST /api/contracts/:id/apply
// @access  Private (Farmer)
const applyForContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    if (contract.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This contract is not currently open for new applications',
      });
    }

    // Check if farmer already applied
    const existingApp = await Application.findOne({
      contract: contract._id,
      farmer: req.user.id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this contract',
      });
    }

    const { farmId, proposedQuantity, proposedDeliveryDate, proposalNote } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm || farm.farmer.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid farm owned by you',
      });
    }

    const application = await Application.create({
      contract: contract._id,
      farmer: req.user.id,
      farm: farm._id,
      proposedQuantity: proposedQuantity || contract.targetQuantity,
      proposedDeliveryDate: proposedDeliveryDate || contract.expectedHarvestDate,
      proposalNote: proposalNote || '',
      status: 'pending',
    });

    // Notify Buyer
    await Notification.create({
      recipient: contract.buyer,
      title: 'New Farmer Application',
      message: `Farmer ${req.user.name} applied for contract ${contract.contractCode} (${contract.cropName}).`,
      type: 'application',
      link: `/buyer/contracts/${contract._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully to contracting buyer',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a contract
// @route   GET /api/contracts/:id/applications
// @access  Private (Buyer, Admin)
const getContractApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ contract: req.params.id })
      .populate('farmer', 'name email phone farmerDetails address')
      .populate('farm')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in farmer's applications
// @route   GET /api/contracts/my-applications
// @access  Private (Farmer)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ farmer: req.user.id })
      .populate({
        path: 'contract',
        populate: { path: 'buyer', select: 'name email phone buyerDetails' },
      })
      .populate('farm')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and Accept/Reject an application
// @route   PUT /api/contracts/applications/:id/status
// @access  Private (Buyer)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted or rejected',
      });
    }

    const application = await Application.findById(req.params.id).populate('contract');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const contract = await Contract.findById(application.contract._id);
    if (contract.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this application',
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewRemarks = reviewRemarks || '';
    await application.save();

    if (status === 'accepted') {
      // Bind contract to this farmer and mark in_progress
      contract.assignedFarmer = application.farmer;
      contract.assignedFarm = application.farm;
      contract.status = 'in_progress';
      await contract.save();

      // Reject other pending applications for this contract
      await Application.updateMany(
        { contract: contract._id, _id: { $ne: application._id }, status: 'pending' },
        { status: 'rejected', reviewRemarks: 'Another proposal was selected.' }
      );

      // Create a Crop tracking record automatically
      const existingCrop = await Crop.findOne({ contract: contract._id });
      if (!existingCrop) {
        await Crop.create({
          contract: contract._id,
          farm: application.farm,
          farmer: application.farmer,
          cropName: contract.cropName,
          variety: contract.variety,
          acreageAllocated: contract.minimumLandRequired,
          sowingDate: contract.sowingDate,
          expectedHarvestDate: contract.expectedHarvestDate,
          stage: 'Sowing',
          growthPercentage: 10,
          healthStatus: 'Good',
          expectedYieldInQuintals: contract.targetQuantity,
          stageHistory: [
            {
              stage: 'Sowing',
              updatedDate: new Date(),
              notes: 'Contract accepted. Sowing initiated according to agreement standards.',
              growthPercentage: 10,
            },
          ],
        });
      }

      // Notify Farmer of acceptance
      await Notification.create({
        recipient: application.farmer,
        title: 'Application Accepted! 🎉',
        message: `Congratulations! Your application for contract ${contract.contractCode} (${contract.cropName}) was accepted. Crop tracking is now active.`,
        type: 'contract',
        link: `/farmer/contracts`,
      });
    } else {
      // Notify Farmer of rejection
      await Notification.create({
        recipient: application.farmer,
        title: 'Application Status Update',
        message: `Your application for contract ${contract.contractCode} was not selected at this time.`,
        type: 'application',
        link: `/farmer/applications`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}`,
      application,
      contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contract status directly
// @route   PUT /api/contracts/:id/status
// @access  Private (Buyer, Admin)
const updateContractStatus = async (req, res, next) => {
  try {
    const { status, assignedOfficer } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    if (status) contract.status = status;
    if (assignedOfficer) contract.assignedOfficer = assignedOfficer;

    await contract.save();

    res.status(200).json({
      success: true,
      message: 'Contract updated successfully',
      contract,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContract,
  getAllContracts,
  getContractById,
  applyForContract,
  getContractApplications,
  getMyApplications,
  updateApplicationStatus,
  updateContractStatus,
};
