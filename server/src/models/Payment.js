const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
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
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    milestoneType: {
      type: String,
      enum: ['Advance Deposit', 'Mid-Term Crop Support', 'Harvest Delivery', 'Final Settlement'],
      default: 'Harvest Delivery',
    },
    quantitySuppliedInQuintals: {
      type: Number,
      default: 0,
    },
    pricePerUnit: {
      type: Number,
      default: 0,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Direct Bank Transfer (NEFT/RTGS)', 'UPI Kisan Pay', 'Platform Escrow Release', 'Cheque'],
      default: 'Platform Escrow Release',
    },
    status: {
      type: String,
      enum: ['pending', 'escrow_held', 'completed', 'failed'],
      default: 'completed',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
