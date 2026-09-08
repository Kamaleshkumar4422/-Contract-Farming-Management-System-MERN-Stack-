const express = require('express');
const router = express.Router();
const {
  createFarm,
  getMyFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getAllFarms,
} = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('farmer', 'admin'), createFarm);
router.get('/my-farms', protect, authorize('farmer'), getMyFarms);
router.get('/', protect, authorize('officer', 'admin', 'buyer'), getAllFarms);
router.get('/:id', protect, getFarmById);
router.put('/:id', protect, authorize('farmer', 'admin'), updateFarm);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteFarm);

module.exports = router;
