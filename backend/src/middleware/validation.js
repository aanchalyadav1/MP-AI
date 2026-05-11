const { body, validationResult } = require('express-validator');

// Registration validation
exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Please provide a valid gender'),
  body('role')
    .optional()
    .isIn(['patient', 'family_member', 'caregiver', 'doctor', 'admin'])
    .withMessage('Please provide a valid role')
];

// Login validation
exports.loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Medicine validation
exports.medicineValidator = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('strength').trim().notEmpty().withMessage('Strength is required'),
  body('dosageForm')
    .isIn(['tablet', 'capsule', 'syrup', 'injection', 'drop', 'inhaler', 'cream', 'ointment', 'patch'])
    .withMessage('Please provide a valid dosage form'),
  body('genericName').optional().trim(),
  body('brand').optional().trim(),
  body('manufacturer').optional().trim(),
  body('activeIngredients').optional().isArray(),
  body('therapeuticClass').optional().trim(),
  body('storageConditions').optional().trim(),
  body('sideEffects').optional().isArray(),
  body('contraindications').optional().isArray(),
  body('interactions').optional().isArray(),
  body('isPrescriptionOnly').optional().isBoolean(),
  body('ndcCode').optional().trim(),
  body('rxnormCode').optional().trim(),
  body('imageUrl').optional().trim(),
  body('barcode').optional().trim()
];

// Prescription validation
exports.prescriptionValidator = [
  body('patientId').isMongoId().withMessage('Please provide a valid patient ID'),
  body('doctorId').isMongoId().withMessage('Please provide a valid doctor ID'),
  body('medicineId').isMongoId().withMessage('Please provide a valid medicine ID'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('frequency').trim().notEmpty().withMessage('Frequency is required'),
  body('route')
    .isIn(['oral', 'topical', 'injection', 'inhalation', 'nasal', 'ocular', 'otic', 'rectal', 'vaginal'])
    .withMessage('Please provide a valid route'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('endDate').optional().isISO8601().withMessage('Please provide a valid end date'),
  body('instructions').optional().trim(),
  body('precautions').optional().isArray(),
  body('refillsRemaining').optional().isInt({ min: 0 }).withMessage('Refills remaining must be a non-negative integer'),
  body('refillAuthorization').optional().isBoolean()
];

// Adherence validation
exports.adherenceValidator = [
  body('prescriptionId').isMongoId().withMessage('Please provide a valid prescription ID'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('taken').isBoolean().withMessage('Taken status is required'),
  body('takenAt').optional().isISO8601().withMessage('Please provide a valid timestamp'),
  body('dosageTaken').optional().trim(),
  body('notes').optional().trim(),
  body('mood')
    .optional()
    .isIn(['great', 'good', 'okay', 'poor', 'terrible'])
    .withMessage('Please provide a valid mood'),
  body('sideEffectsExperienced').optional().isArray(),
  body('skippedReason')
    .optional()
    .isIn(['forgot', 'side_effects', 'feeling_better', 'ran_out', 'cost', 'other'])
    .withMessage('Please provide a valid skip reason'),
  body('skippedReasonDetails').optional().trim()
];

// Validation result handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};