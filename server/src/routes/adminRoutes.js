const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
