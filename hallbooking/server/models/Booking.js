const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  people: {
    type: Number,
    required: true
  },
  mics: {
    type: Number,
    default: 0
  },
  projector: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  startMinutes: {
    type: Number,
  },
  endMinutes: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Convert times to 12hr AM/PM format and compute minutes
bookingSchema.pre('save', function(next) {
  console.log('=== MODEL SAVE DEBUG ===');
  console.log('Raw startTime:', this.startTime);
  console.log('Raw endTime:', this.endTime);
  
  if (this.isModified('startTime') && this.startTime) {
    // Compute minutes from raw 24hr input FIRST
    this.startMinutes = parse24hrToMinutes(this.startTime);
    // THEN format for display
    const formattedStart = format24hrTo12hr(this.startTime);
    console.log('Formatted startTime:', formattedStart);
    this.startTime = formattedStart;
  }
  if (this.isModified('endTime') && this.endTime) {
    // Compute minutes from raw 24hr input FIRST
    this.endMinutes = parse24hrToMinutes(this.endTime);
    // THEN format for display
    const formattedEnd = format24hrTo12hr(this.endTime);
    console.log('Formatted endTime:', formattedEnd);
    this.endTime = formattedEnd;
  }
  console.log('Minutes start/end:', this.startMinutes, '/', this.endMinutes);
  console.log('====================');
  next();
});

// Helper to convert 24hr to 12hr AM/PM
function format24hrTo12hr(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let hour = hours % 12;
  if (hour === 0) hour = 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  const minStr = minutes.toString().padStart(2, '0');
  return `${hour}:${minStr} ${period}`;
}

// Helper to parse 24hr time string to minutes since midnight (e.g., "09:15" → 9*60+15)
function parse24hrToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}


// Index for efficient queries
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ hall: 1, date: 1 });
bookingSchema.index({ hall: 1, date: 1, startMinutes: 1, endMinutes: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

