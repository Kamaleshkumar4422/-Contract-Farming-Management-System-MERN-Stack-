const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  respondToComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createComplaint);
router.get('/my-complaints', protect, getMyComplaints);
router.get('/', protect, authorize('admin'), getAllComplaints);
router.put('/:id/respond', protect, authorize('admin'), respondToComplaint);

module.exports = router;
