const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a hall name'],
    trim: true,
    maxlength: [100, 'Hall name cannot be more than 100 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide hall capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  location: {
    type: String,
    required: [true, 'Please provide hall location'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);

