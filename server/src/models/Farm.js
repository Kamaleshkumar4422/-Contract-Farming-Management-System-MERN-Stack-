const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmName: {
      type: String,
      required: [true, 'Please provide a name or label for the farm'],
      trim: true,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Please provide land survey / Khata number'],
    },
    areaInAcres: {
      type: Number,
      required: [true, 'Please specify total farm area in acres'],
      min: [0.1, 'Farm area must be greater than 0'],
    },
    soilType: {
      type: String,
      enum: ['Black Soil', 'Alluvial Soil', 'Red & Yellow', 'Laterite', 'Clayey Loam', 'Sandy Loam'],
      default: 'Clayey Loam',
    },
    irrigationSource: {
      type: String,
      enum: ['Borewell', 'Canal Irrigation', 'Drip System', 'Rainfed / Natural', 'Sprinkler System'],
      default: 'Drip System',
    },
    waterAvailability: {
      type: String,
      enum: ['Year-Round', 'Seasonal', 'Limited'],
      default: 'Year-Round',
    },
    location: {
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, default: '' },
      latitude: { type: Number, default: 21.1458 },
      longitude: { type: Number, default: 79.0882 },
    },
    currentCrops: [{ type: String }],
    soilHealthScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    organicCertified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Farm', farmSchema);
