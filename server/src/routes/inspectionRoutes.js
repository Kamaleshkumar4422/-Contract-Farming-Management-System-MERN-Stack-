const express = require('express');
const router = express.Router();
const {
  createInspection,
  getInspectionsByContract,
  getMyInspections,
  getAllInspections,
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('officer', 'admin'), createInspection);
router.get('/my-inspections', protect, authorize('officer'), getMyInspections);
router.get('/contract/:contractId', protect, getInspectionsByContract);
router.get('/', protect, authorize('officer', 'admin', 'buyer'), getAllInspections);

module.exports = router;
