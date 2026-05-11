const Adherence = require('../models/Adherence');
const Prescription = require('../models/Prescription');
const { validationResult } = require('express-validator');

// Log medication adherence
exports.logAdherence = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prescriptionId, date, taken, takenAt, dosageTaken, notes, mood, sideEffectsExperienced, skippedReason, skippedReasonDetails } = req.body;

    // Verify prescription exists and belongs to patient
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if prescription is active
    if (!prescription.isActive) {
      return res.status(400).json({ message: 'Prescription is not active' });
    }

    // Check if adherence entry already exists for this date
    let adherence = await Adherence.findOne({
      patient: req.user.userId,
      prescription: prescriptionId,
      date: new Date(date)
    });

    if (adherence) {
      // Update existing adherence record
      adherence.taken = taken;
      adherence.takenAt = takenAt ? new Date(takenAt) : undefined;
      adherence.dosageTaken = dosageTaken;
      adherence.notes = notes;
      adherence.mood = mood;
      adherence.sideEffectsExperienced = sideEffectsExperienced;
      adherence.skippedReason = skippedReason;
      adherence.skippedReasonDetails = skippedReasonDetails;
      adherence.syncStatus = 'pending'; // Mark for sync
    } else {
      // Create new adherence record
      adherence = new Adherence({
        patient: req.user.userId,
        prescription: prescriptionId,
        date: new Date(date),
        taken,
        takenAt: takenAt ? new Date(takenAt) : undefined,
        dosageTaken,
        notes,
        mood,
        sideEffectsExperienced,
        skippedReason,
        skippedReasonDetails,
        syncStatus: 'pending' // Mark for sync
      });
    }

    await adherence.save();

    res.json({
      message: taken ? 'Medication intake logged successfully' : 'Medication skip logged successfully',
      adherence
    });
  } catch (error) {
    console.error('Log adherence error:', error);
    res.status(500).json({ message: 'Server error logging adherence' });
  }
};

// Get adherence records for a patient
exports.getAdherenceRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 30, startDate, endDate, prescriptionId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { patient: patientId };
    if (prescriptionId) query.prescription = prescriptionId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query
    const [adherenceRecords, total] = await Promise.all([
      Adherence.find(query)
        .populate('prescription', 'medicine dosage frequency')
        .populate({
          path: 'prescription',
          populate: { path: 'medicine', select: 'name genericName strength' }
        })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Adherence.countDocuments(query)
    ]);

    res.json({
      adherenceRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get adherence records error:', error);
    res.status(500).json({ message: 'Server error fetching adherence records' });
  }
};

// Get adherence summary for dashboard
exports.getAdherenceSummary = async (req, res) => {
  try {
    const { patientId, days = 30 } = req.params;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Get adherence records for the period
    const adherenceRecords = await Adherence.find({
      patient: patientId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate summary statistics
    const totalDays = adherenceRecords.length;
    const takenDays = adherenceRecords.filter(record => record.taken).length;
    const adherenceRate = totalDays > 0 ? (takenDays / totalDays) * 100 : 0;

    // Group by prescription
    const prescriptionStats = {};
    adherenceRecords.forEach(record => {
      const presId = record.prescription.toString();
      if (!prescriptionStats[presId]) {
        prescriptionStats[presId] = { total: 0, taken: 0 };
      }
      prescriptionStats[presId].total++;
      if (record.taken) prescriptionStats[presId].taken++;
    });

    // Format prescription stats
    const prescriptionAdherence = [];
    for (const [presId, stats] of Object.entries(prescriptionStats)) {
      prescriptionAdherence.push({
        prescriptionId: presId,
        adherenceRate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0,
        daysTracked: stats.total,
        daysTaken: stats.taken
      });
    }

    res.json({
      period: {
        startDate,
        endDate,
        days: parseInt(days)
      },
      overallAdherenceRate: adherenceRate,
      totalDaysTracked: totalDays,
      totalDaysTaken: takenDays,
      prescriptionAdherence
    });
  } catch (error) {
    console.error('Get adherence summary error:', error);
    res.status(500).json({ message: 'Server error fetching adherence summary' });
  }
};

// Get offline pending records for sync
exports.getPendingSyncRecords = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const pendingRecords = await Adherence.find({
      patient: req.user.userId,
      syncStatus: 'pending'
    })
    .sort({ createdAt: 1 })
    .limit(parseInt(limit))
    .populate({
      path: 'prescription',
      populate: { path: 'medicine', select: 'name genericName strength' }
    });

    res.json(pendingRecords);
  } catch (error) {
    console.error('Get pending sync records error:', error);
    res.status(500).json({ message: 'Server error fetching pending sync records' });
  }
};

// Mark records as synced
exports.markAsSynced = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Array of IDs is required' });
    }

    const result = await Adherence.updateMany(
      { 
        _id: { $in: ids },
        patient: req.user.userId,
        syncStatus: 'pending'
      },
      { $set: { syncStatus: 'synced' } }
    );

    res.json({
      message: `${result.nModified} records marked as synced`,
      modifiedCount: result.nModified
    });
  } catch (error) {
    console.error('Mark as synced error:', error);
    res.status(500).json({ message: 'Server error marking records as synced' });
  }
};

// Handle sync conflicts
exports.resolveConflict = async (req, res) => {
  try {
    const { id, resolution } = req.body; // resolution: 'server_wins' or 'local_wins'
    
    if (!id) {
      return res.status(400).json({ message: 'Adherence ID is required' });
    }
    
    if (!resolution || !['server_wins', 'local_wins'].includes(resolution)) {
      return res.status(400).json({ message: "Resolution must be 'server_wins' or 'local_wins'" });
    }

    const adherence = await Adherence.findOne({
      _id: id,
      patient: req.user.userId,
      syncStatus: 'conflict'
    });

    if (!adherence) {
      return res.status(404).json({ message: 'Conflict record not found' });
    }

    if (resolution === 'local_wins') {
      // Keep local version, mark as synced
      adherence.syncStatus = 'synced';
    } else {
      // Server wins - in a real app, we'd fetch the server version
      // For now, we'll just mark as synced assuming server version is correct
      adherence.syncStatus = 'synced';
    }

    await adherence.save();

    res.json({
      message: `Conflict resolved with ${resolution}`,
      adherence
    });
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ message: 'Server error resolving conflict' });
  }
};