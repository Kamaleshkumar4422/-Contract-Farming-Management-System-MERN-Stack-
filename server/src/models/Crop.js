const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
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
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    variety: {
      type: String,
      default: '',
    },
    acreageAllocated: {
      type: Number,
      required: true,
    },
    sowingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    actualHarvestDate: {
      type: Date,
    },
    stage: {
      type: String,
      enum: ['Sowing', 'Vegetative', 'Flowering', 'Maturation', 'Harvested'],
      default: 'Sowing',
    },
    growthPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    healthStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Pest Risk', 'Critical'],
      default: 'Good',
    },
    expectedYieldInQuintals: {
      type: Number,
      default: 0,
    },
    actualYieldInQuintals: {
      type: Number,
      default: 0,
    },
    stageHistory: [
      {
        stage: { type: String, required: true },
        updatedDate: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        growthPercentage: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
