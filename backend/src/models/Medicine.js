const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  strength: {
    type: String, // e.g., "500mg", "10ml"
    required: true
  },
  dosageForm: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drop', 'inhaler', 'cream', 'ointment', 'patch'],
    required: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  activeIngredients: [{
    name: String,
    strength: String
  }],
  therapeuticClass: {
    type: String,
    trim: true
  },
  storageConditions: {
    type: String,
    trim: true
  },
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  isPrescriptionOnly: {
    type: Boolean,
    default: false
  },
  ndcCode: {
    type: String,
    unique: true,
    sparse: true
  },
  rxnormCode: {
    type: String,
    unique: true,
    sparse: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster search
medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);