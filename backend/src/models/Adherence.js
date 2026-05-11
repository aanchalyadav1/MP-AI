const mongoose = require('mongoose');

const adherenceSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  taken: {
    type: Boolean,
    default: false
  },
  takenAt: {
    type: Date
  },
  dosageTaken: {
    type: String // Actual dosage taken (may differ from prescribed)
  },
  notes: {
    type: String,
    trim: true
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'poor', 'terrible']
  },
  sideEffectsExperienced: [String],
  skippedReason: {
    type: String,
    enum: ['forgot', 'side_effects', 'feeling_better', 'ran_out', 'cost', 'other']
  },
  skippedReasonDetails: {
    type: String,
    trim: true
  },
  // For offline sync tracking
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'conflict'],
    default: 'pending'
  },
  localId: {
    type: String, // Local ID for offline first apps
    sparse: true
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

// Compound index for efficient querying
adherenceSchema.index({ patient: 1, date: -1 });
adherenceSchema.index({ prescription: 1, date: -1 });
adherenceSchema.index({ syncStatus: 1 });

module.exports = mongoose.model('Adherence', adherenceSchema);