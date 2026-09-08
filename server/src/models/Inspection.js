const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
    },
    cropCondition: {
      type: String,
      enum: ['Excellent', 'Healthy / Good', 'Fair / Needs Care', 'Severe Pest Infection', 'Damaged'],
      default: 'Healthy / Good',
    },
    growthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pestOrDiseaseDetected: {
      type: Boolean,
      default: false,
    },
    pestDiseaseDetails: {
      type: String,
      default: 'None observed. Canopy foliage healthy.',
    },
    soilMoistureCondition: {
      type: String,
      enum: ['Optimal', 'Dry / Underwatered', 'Waterlogged', 'Saline / Alkaline'],
      default: 'Optimal',
    },
    irrigationStatus: {
      type: String,
      enum: ['Operational', 'Partially Blocked', 'Deficient', 'Inactive'],
      default: 'Operational',
    },
    remarks: {
      type: String,
      required: [true, 'Please provide officer field remarks'],
    },
    recommendedActions: {
      type: String,
      default: 'Continue standard micro-nutrient fertigation and weed maintenance.',
    },
    photos: [{ type: String }],
    overallScore: {
      type: Number,
      default: 88,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
