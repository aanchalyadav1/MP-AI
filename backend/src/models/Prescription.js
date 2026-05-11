const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  dosage: {
    type: String, // e.g., "1 tablet", "5ml"
    required: true
  },
  frequency: {
    type: String, // e.g., "twice daily", "every 8 hours"
    required: true
  },
  route: {
    type: String, // e.g., "oral", "topical", "injection"
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  instructions: {
    type: String,
    trim: true
  },
  precautions: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  prescriptionNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  refillsRemaining: {
    type: Number,
    default: 0
  },
  refillAuthorization: {
    type: Boolean,
    default: false
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

// Index for faster queries
prescriptionSchema.index({ patient: 1, isActive: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ medicine: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);