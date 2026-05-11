const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create new prescription
exports.createPrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, doctorId, medicineId, dosage, frequency, route, startDate, endDate, instructions, precautions } = req.body;

    // Validate that patient, doctor, and medicine exist
    const [patient, doctor, medicine] = await Promise.all([
      User.findById(patientId),
      User.findById(doctorId),
      Medicine.findById(medicineId)
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if doctor is actually a doctor (role validation)
    if (doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    // Generate prescription number (simplified - in production use proper algorithm)
    const prescriptionNumber = `RX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create prescription
    const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      medicine: medicineId,
      dosage,
      frequency,
      route,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      instructions,
      precautions,
      prescriptionNumber
    });

    await prescription.save();

    // Populate references for response
    await prescription.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
      { path: 'medicine', select: 'name genericName strength dosageForm' }
    ]);

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error creating prescription' });
  }
};

// Get prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { patient: patientId };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query
    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('medicine', 'name genericName strength dosageForm')
        .populate('doctor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prescription.countDocuments(query)
    ]);

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error fetching prescriptions' });
  }
};

// Get prescriptions by doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { doctor: doctorId };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query
    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('patient', 'name email')
        .populate('medicine', 'name genericName strength dosageForm')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prescription.countDocuments(query)
    ]);

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ message: 'Server error fetching prescriptions' });
  }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('medicine');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({ message: 'Server error fetching prescription' });
  }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescriptionId = req.params.id;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    // Find and update prescription
    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('medicine', 'name genericName strength dosageForm');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Server error updating prescription' });
  }
};

// Delete prescription (soft delete)
exports.deletePrescription = async (req, res) => {
  try {
    const prescriptionId = req.params.id;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { $set: { isActive: false } },
      { new: true }
    )
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('medicine', 'name genericName strength dosageForm');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deactivated successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Server error deleting prescription' });
  }
};

// Get active prescriptions for adherence tracking
exports.getActivePrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const prescriptions = await Prescription.find({
      patient: patientId,
      isActive: true,
      startDate: { $lte: today },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: today } }
      ]
    })
    .populate('medicine', 'name genericName strength dosageForm')
    .sort({ startDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get active prescriptions error:', error);
    res.status(500).json({ message: 'Server error fetching active prescriptions' });
  }
};