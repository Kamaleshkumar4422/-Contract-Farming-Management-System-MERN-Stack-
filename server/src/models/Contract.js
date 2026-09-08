const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contractCode: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide contract title'],
      trim: true,
    },
    cropName: {
      type: String,
      required: [true, 'Please specify crop name'],
      trim: true,
    },
    variety: {
      type: String,
      default: 'Standard Certified Variety',
    },
    targetQuantity: {
      type: Number,
      required: [true, 'Please specify required quantity (Quintals)'],
    },
    minimumLandRequired: {
      type: Number,
      required: [true, 'Please specify minimum land area required (Acres)'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Please specify purchase price per unit (INR)'],
    },
    unit: {
      type: String,
      default: 'Quintal',
    },
    totalEstimatedValue: {
      type: Number,
      default: 0,
    },
    sowingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    qualityStandards: {
      minimumGrade: { type: String, default: 'Grade A' },
      maxMoisturePercentage: { type: Number, default: 12 },
      allowedDefectsPercentage: { type: Number, default: 2 },
      organicPreferred: { type: Boolean, default: false },
      customSpecifications: { type: String, default: 'Clean, mature, free from mould or live weevils.' },
    },
    termsAndConditions: {
      type: String,
      default: '1. Timely sowing and adherence to GAP (Good Agricultural Practices). 2. Field officer visits must be facilitated. 3. Buyer guarantees MSP+ premium on delivery. 4. Escrow payout within 48h of quality sign-off.',
    },
    advancePaymentPercentage: {
      type: Number,
      default: 20,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    assignedFarmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedFarm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    qrCodeData: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate estimated total
contractSchema.pre('save', function (next) {
  if (this.targetQuantity && this.pricePerUnit) {
    this.totalEstimatedValue = this.targetQuantity * this.pricePerUnit;
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
