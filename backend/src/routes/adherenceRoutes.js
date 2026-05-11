const express = require('express');
const router = express.Router();
const adherenceController = require('../controllers/adherenceController');
const { protect } = require('../middleware/auth');
const { adherenceValidator, handleValidationErrors } = require('../middleware/validation');

// Protected routes (require authentication)
router.use(protect);

// Log medication adherence
router.post('/', adherenceValidator, handleValidationErrors, adherenceController.logAdherence);

// Get adherence records for a patient
router.get('/patient/:patientId', adherenceController.getAdherenceRecords);

// Get adherence summary for dashboard
router.get('/summary/:patientId/:days?', adherenceController.getAdherenceSummary);

// Get pending sync records for offline first
router.get('/pending-sync', adherenceController.getPendingSyncRecords);

// Mark records as synced
router.post('/mark-synced', adherenceController.markAsSynced);

// Resolve sync conflicts
router.post('/resolve-conflict', adherenceController.resolveConflict);

module.exports = router;