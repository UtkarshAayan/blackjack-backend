const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID from the token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return the user details
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    // Handle token verification errors or database errors
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

  
  // Edit Profile
  exports.editProfile = async (req, res) => {
    const { name, mobileNo, email } = req.body;
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = name || user.name;
        user.mobileNo = mobileNo || user.mobileNo;
        user.email = email || user.email;
        await user.save();
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

  
  exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
  
    try {
      // Extract token from headers
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
  
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Find user by decoded ID
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Hash the new password before saving it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.json({ success: true, message: 'Password updated successfully' });
  
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
    }
  };
  
  // Delete Account
  exports.deleteAccount = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user._id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  