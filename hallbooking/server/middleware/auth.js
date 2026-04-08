const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
console.log('protect middleware - Authorization header:', req.headers.authorization);
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token - try User then Admin
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        req.user = await Admin.findById(decoded.id).select('-password');
      }
      if (!req.user) {
        throw new Error('User not found');
      }
      next();
    } catch (error) {
      console.error('Not authorized');
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('No token, not authorized. Full headers:', req.headers);
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin protection middleware
const adminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        req.user = await Admin.findById(decoded.id).select('-password');
      }
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect, adminProtect };

