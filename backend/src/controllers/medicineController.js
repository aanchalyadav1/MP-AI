const Medicine = require('../models/Medicine');
const { validationResult } = require('express-validator');

// Get all medicines (with optional search and pagination)
exports.getMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Medicine.countDocuments(query)
    ]);

    res.json({
      medicines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: 'Server error fetching medicines' });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    console.error('Get medicine by ID error:', error);
    res.status(500).json({ message: 'Server error fetching medicine' });
  }
};

// Create new medicine (admin/doctor only)
exports.createMedicine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicineData = req.body;

    // Check if medicine with same name and strength already exists (optional)
    const existingMedicine = await Medicine.findOne({
      name: medicineData.name,
      strength: medicineData.strength
    });

    if (existingMedicine) {
      return res.status(400).json({ 
        message: 'Medicine with this name and strength already exists' 
      });
    }

    const medicine = new Medicine(medicineData);
    await medicine.save();

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Medicine with this identifier already exists' 
      });
    }
    res.status(500).json({ message: 'Server error creating medicine' });
  }
};

// Update medicine (admin/doctor only)
exports.updateMedicine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicineId = req.params.id;
    const updateData = req.body;

    // Find and update medicine
    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      message: 'Medicine updated successfully',
      medicine
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Medicine with this identifier already exists' 
      });
    }
    res.status(500).json({ message: 'Server error updating medicine' });
  }
};

// Delete medicine (soft delete - admin only)
exports.deleteMedicine = async (req, res) => {
  try {
    const medicineId = req.params.id;

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deactivated successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Server error deleting medicine' });
  }
};

// Search medicines (for autocomplete)
exports.searchMedicines = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const medicines = await Medicine.find(
      { 
        $text: { $search: q },
        isActive: true 
      },
      { 
        score: { $meta: "textScore" } 
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit))
    .select('name genericName brand strength dosageForm _id');

    res.json(medicines);
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({ message: 'Server error searching medicines' });
  }
};