const express = require('express');
const router = express.Router();
const {
  createContract,
  getAllContracts,
  getContractById,
  applyForContract,
  getContractApplications,
  getMyApplications,
  updateApplicationStatus,
  updateContractStatus,
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('buyer', 'admin'), createContract);
router.get('/', getAllContracts);
router.get('/my-applications', protect, authorize('farmer'), getMyApplications);
router.get('/:id', getContractById);
router.post('/:id/apply', protect, authorize('farmer'), applyForContract);
router.get('/:id/applications', protect, authorize('buyer', 'admin'), getContractApplications);
router.put('/applications/:id/status', protect, authorize('buyer', 'admin'), updateApplicationStatus);
router.put('/:id/status', protect, authorize('buyer', 'admin'), updateContractStatus);

module.exports = router;
