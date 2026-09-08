const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    complaintNumber: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Payment Dispute',
        'Delayed Pickup/Delivery',
        'Quality Disagreement',
        'Field Inspection Concern',
        'Breach of Terms',
        'Other',
      ],
      default: 'Payment Dispute',
    },
    subject: {
      type: String,
      required: [true, 'Please provide complaint subject'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description of your grievance'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['open', 'under_investigation', 'resolved', 'closed'],
      default: 'open',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
