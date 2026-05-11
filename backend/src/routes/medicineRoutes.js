const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');
const { medicineValidator, handleValidationErrors } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/', medicineController.getMedicines);
router.get('/search', medicineController.searchMedicines);
router.get('/:id', medicineController.getMedicineById);

// Protected routes (require authentication)
router.use(protect);

// Admin/Doctor only routes
router.post('/', authorize('admin', 'doctor'), medicineValidator, handleValidationErrors, medicineController.createMedicine);
router.put('/:id', authorize('admin', 'doctor'), medicineValidator, handleValidationErrors, medicineController.updateMedicine);
router.delete('/:id', authorize('admin'), medicineController.deleteMedicine);

module.exports = router;