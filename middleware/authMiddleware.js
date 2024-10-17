const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
  }
};


// Middleware to verify JWT token
exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Log the decoded token to see what it contains
      console.log('Decoded token:', decoded);

      // Check if the decoded token contains user ID
      if (!decoded._id) {
          return res.status(400).json({ success: false, message: 'Invalid token payload. User ID not found.' });
      }

      req.user = decoded; // Attach decoded user to request object
      next();
  } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
  }
};





