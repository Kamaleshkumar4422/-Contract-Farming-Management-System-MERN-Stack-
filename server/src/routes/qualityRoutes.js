const express = require('express');
const router = express.Router();
const {
  createQualityCheck,
  getQualityChecksByContract,
  getQualityChecksByFarmer,
  getAllQualityChecks,
} = require('../controllers/qualityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('buyer', 'admin'), createQualityCheck);
router.get('/my-checks', protect, authorize('farmer'), getQualityChecksByFarmer);
router.get('/contract/:contractId', protect, getQualityChecksByContract);
router.get('/', protect, authorize('buyer', 'admin'), getAllQualityChecks);

module.exports = router;
