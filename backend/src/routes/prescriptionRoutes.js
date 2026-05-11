const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const { prescriptionValidator, handleValidationErrors } = require('../middleware/validation');

// Protected routes (require authentication)
router.use(protect);

// Patient prescriptions
router.get('/patient/:patientId', authorize('patient', 'family_member', 'caregiver', 'doctor', 'admin'), prescriptionController.getPatientPrescriptions);

// Doctor prescriptions
router.get('/doctor/:doctorId', authorize('doctor', 'admin'), prescriptionController.getDoctorPrescriptions);

// Active prescriptions for adherence tracking
router.get('/active/:patientId', authorize('patient', 'family_member', 'caregiver'), prescriptionController.getActivePrescriptions);

// Prescription by ID
router.get('/:id', prescriptionController.getPrescriptionById);

// Create prescription (doctor only)
router.post('/', authorize('doctor'), prescriptionValidator, handleValidationErrors, prescriptionController.createPrescription);

// Update prescription (doctor only)
router.put('/:id', authorize('doctor'), prescriptionValidator, handleValidationErrors, prescriptionController.updatePrescription);

// Delete prescription (doctor only)
router.delete('/:id', authorize('doctor'), prescriptionController.deletePrescription);

module.exports = router;