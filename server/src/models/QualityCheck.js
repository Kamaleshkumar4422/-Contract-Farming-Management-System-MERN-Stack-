const mongoose = require('mongoose');

const qualityCheckSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suppliedQuantityInQuintals: {
      type: Number,
      required: true,
    },
    moistureLevelPercentage: {
      type: Number,
      required: true,
    },
    foreignMatterPercentage: {
      type: Number,
      default: 0.5,
    },
    grainSizeUniformityPercentage: {
      type: Number,
      default: 95,
    },
    qualityGrade: {
      type: String,
      enum: ['Grade A+', 'Grade A', 'Grade B', 'Grade C', 'Rejected'],
      required: true,
    },
    qualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected', 'Conditional Acceptance', 'Pending Review'],
      default: 'Approved',
    },
    certifiedBy: {
      type: String,
      default: 'Authorized Quality Inspector',
    },
    certificateNumber: {
      type: String,
      unique: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QualityCheck', qualityCheckSchema);
