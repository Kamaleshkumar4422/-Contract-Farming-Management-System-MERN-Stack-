const express = require('express');
const router = express.Router();
const {
  createPayment,
  getFarmerPayments,
  getBuyerPayments,
  getPaymentsByContract,
  releasePaymentEscrow,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('buyer', 'admin'), createPayment);
router.get('/my-payments', protect, authorize('farmer'), getFarmerPayments);
router.get('/buyer-payments', protect, authorize('buyer'), getBuyerPayments);
router.get('/contract/:contractId', protect, getPaymentsByContract);
router.put('/:id/release', protect, authorize('buyer', 'admin'), releasePaymentEscrow);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;
