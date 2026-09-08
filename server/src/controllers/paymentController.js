const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');

// @desc    Initiate or record a payment
// @route   POST /api/payments
// @access  Private (Buyer, Admin)
const createPayment = async (req, res, next) => {
  try {
    const {
      contractId,
      farmerId,
      milestoneType,
      quantitySuppliedInQuintals,
      pricePerUnit,
      grossAmount,
      deductions,
      netAmount,
      paymentMethod,
      notes,
    } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    const randNum = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `TXN-${Date.now().toString().slice(-6)}-${randNum}`;
    const receiptNumber = `RCPT-${new Date().getFullYear()}-${randNum}`;

    const payment = await Payment.create({
      contract: contractId,
      buyer: req.user.id,
      farmer: farmerId || contract.assignedFarmer,
      transactionId,
      milestoneType: milestoneType || 'Advance Deposit',
      quantitySuppliedInQuintals: quantitySuppliedInQuintals || 0,
      pricePerUnit: pricePerUnit || contract.pricePerUnit,
      grossAmount: Number(grossAmount),
      deductions: deductions ? Number(deductions) : 0,
      netAmount: Number(netAmount || grossAmount),
      paymentMethod: paymentMethod || 'Platform Escrow Release',
      status: 'completed',
      receiptNumber,
      notes: notes || '',
    });

    // Notify Farmer
    const recipientId = farmerId || contract.assignedFarmer;
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        title: `Payment Disbursed: ₹${(netAmount || grossAmount).toLocaleString()}`,
        message: `Buyer disbursed ${milestoneType} of ₹${(netAmount || grossAmount).toLocaleString()} for Contract ${contract.contractCode}. Txn ID: ${transactionId}.`,
        type: 'payment',
        link: `/farmer/payments`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded and disbursed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in farmer's payment passbook
// @route   GET /api/payments/my-payments
// @access  Private (Farmer)
const getFarmerPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ farmer: req.user.id })
      .populate('contract')
      .populate('buyer', 'name buyerDetails email phone')
      .sort({ paymentDate: -1 });

    const totalEarned = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.netAmount, 0);

    const pendingEscrow = payments
      .filter((p) => p.status === 'escrow_held' || p.status === 'pending')
      .reduce((sum, p) => sum + p.netAmount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalEarned,
      pendingEscrow,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get buyer's outgoing payments
// @route   GET /api/payments/buyer-payments
// @access  Private (Buyer)
const getBuyerPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ buyer: req.user.id })
      .populate('contract')
      .populate('farmer', 'name email phone farmerDetails')
      .sort({ paymentDate: -1 });

    const totalDisbursed = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.netAmount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalDisbursed,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments for a specific contract
// @route   GET /api/payments/contract/:contractId
// @access  Private
const getPaymentsByContract = async (req, res, next) => {
  try {
    const payments = await Payment.find({ contract: req.params.contractId })
      .populate('farmer', 'name email phone')
      .populate('buyer', 'name buyerDetails')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release Escrow / Update payment status
// @route   PUT /api/payments/:id/release
// @access  Private (Buyer, Admin)
const releasePaymentEscrow = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('contract');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    payment.status = 'completed';
    payment.paymentDate = new Date();
    await payment.save();

    // Notify Farmer
    await Notification.create({
      recipient: payment.farmer,
      title: 'Escrow Funds Released! 💰',
      message: `Escrow release of ₹${payment.netAmount.toLocaleString()} has been credited to your bank account for contract ${payment.contract?.contractCode || ''}.`,
      type: 'payment',
      link: `/farmer/payments`,
    });

    res.status(200).json({
      success: true,
      message: 'Escrow payment released to farmer successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments across platform (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('contract')
      .populate('farmer', 'name email phone')
      .populate('buyer', 'name buyerDetails')
      .sort({ paymentDate: -1 });

    const grossValue = payments.reduce((sum, p) => sum + p.netAmount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      grossValue,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getFarmerPayments,
  getBuyerPayments,
  getPaymentsByContract,
  releasePaymentEscrow,
  getAllPayments,
};
