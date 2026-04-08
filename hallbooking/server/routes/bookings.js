const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const User = require('../models/User');
const { protect, adminProtect } = require('../middleware/auth');
const { sendBookingNotification } = require('../utils/email');

// Helper to parse 24hr time string to minutes since midnight
function parse24hrToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// @desc Check hall availability for time slot
router.post('/check-availability', protect, async (req, res) => {
  try {
    const { hall, date, startTime, endTime } = req.body;

    if (!hall || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        available: false, 
        message: 'Missing required fields: hall, date, startTime, endTime' 
      });
    }

    const startMinutes = parse24hrToMinutes(startTime);
    const endMinutes = parse24hrToMinutes(endTime);

    // Check time slot availability using numeric minutes
    const existingBooking = await Booking.findOne({
      hall,
      date,
      $or: [
        { startMinutes: { $lt: endMinutes }, endMinutes: { $gt: startMinutes } }
      ]
    });

    if (existingBooking) {
      return res.json({ 
        available: false, 
        message: `This hall is already booked during this time on ${date}` 
      });
    }

    res.json({ 
      available: true, 
      message: 'Time slot available' 
    });
  } catch (error) {
    res.status(500).json({ 
      available: false, 
      message: error.message 
    });
  }
});

// @desc Create new booking (user)
router.post('/', protect, async (req, res) => {
  try {
    const { hall, purpose, people, mics, projector, date, startTime, endTime } = req.body;

    // Check if hall exists
    const hallExists = await Hall.findById(hall);
    if (!hallExists) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    const startMinutes = parse24hrToMinutes(startTime);
    const endMinutes = parse24hrToMinutes(endTime);

    // Atomic booking: check conflict using minutes AND create
    const existingBooking = await Booking.findOne({
      hall,
      date,
      $or: [
        { startMinutes: { $lt: endMinutes }, endMinutes: { $gt: startMinutes } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: `This hall is already booked during this time on ${date} (overlaps with booking ${existingBooking._id})` 
      });
    }

    const bookingData = {
      user: req.user._id,
      hall,
      purpose,
      people: Number(people),
      mics: Number(mics) || 0,
      projector: Boolean(projector),
      date,
      startTime,  // raw 24hr - model will format and compute minutes
      endTime
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get all bookings (admin)
router.get('/', adminProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('hall', 'name location capacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments();

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get user's bookings (user)
router.get('/mybookings', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user._id })
      .populate('hall', 'name location capacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Update booking status (admin approve/reject)
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Send email notification if status changed to Approved or Rejected
    if ((status === 'Approved' || status === 'Rejected') && status !== oldStatus && booking.user) {
      try {
        const populatedBooking = await Booking.findById(booking._id)
          .populate('user', 'name email')
          .populate('hall', 'name');
        
        if (populatedBooking.user && populatedBooking.user.email) {
          const emailSent = await sendBookingNotification(
            populatedBooking.user.email, 
            populatedBooking, 
            status
          );
          if (!emailSent) {
            console.warn('Failed to send email notification');
          }
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Delete booking (admin or owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get booking stats for dashboard (admin)
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
          },
          allStatuses: { $push: '$status' }
        }
      }
    ]);

    const result = {
      success: true,
      stats: stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 }
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

