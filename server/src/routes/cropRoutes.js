const express = require('express');
const router = express.Router();
const {
  getFarmerCrops,
  getCropByContract,
  updateCropStage,
  getAllCrops,
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my-crops', protect, authorize('farmer'), getFarmerCrops);
router.get('/contract/:contractId', protect, getCropByContract);
router.put('/:id/stage', protect, updateCropStage);
router.get('/', protect, authorize('admin', 'buyer', 'officer'), getAllCrops);

module.exports = router;
