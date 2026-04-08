const express = require('express');
const router = express.Router();
const Hall = require('../models/Hall');
const { protect, adminProtect } = require('../middleware/auth');

// @route   GET /api/halls
// @desc    Get all halls (users can view)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    res.json(halls);
  } catch (error) {
    console.error('POST /halls ERROR FULL:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/halls
// @desc    Create new hall
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  console.log('POST /halls - Authenticated user:', req.user?.id);
  console.log('POST /halls - Request body:', req.body);
  try {
    const { name, capacity, location, description, available } = req.body;

    // Basic validation
    if (!name || !capacity || !location) {
      return res.status(400).json({ message: 'Name, capacity and location are required' });
    }

    const hall = await Hall.create({
      name,
      capacity,
      location,
      description,
      available: available !== undefined ? available : true
    });

    res.status(201).json(hall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PUT /api/halls/:id
// @desc    Update hall
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const hall = await Hall.findByIdAndUpdate(
      id,
      { ...updateData, available: updateData.available !== undefined ? updateData.available : true },
      { new: true, runValidators: true }
    );

    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.json(hall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   DELETE /api/halls/:id
// @desc    Delete hall
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const hall = await Hall.findByIdAndDelete(id);

    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;

