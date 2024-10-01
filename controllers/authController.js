const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Signup
exports.signup = async (req, res) => {
  const { name, email, mobileNo, password } = req.body;
  try {
    const user = new User({ name, email, mobileNo, password });
    await user.save();
    res.status(201).json({ success: true, message: "User created while signup" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.comparePassword(password)) {
      const token = generateToken(user._id);
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};




// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send OTP via email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP code is ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

// Forgot Password controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate an OTP (6-digit random number)
    const otp = crypto.randomInt(100000, 999999);

    // Generate a JWT token that includes the OTP
    const token = jwt.sign({ userId: user._id, otp }, process.env.JWT_SECRET, {
      expiresIn: '10m', // Token expires in 10 minutes
    });

    // Save OTP and token in user's record (or you can use a cache like Redis)
    user.resetPasswordToken = token;
    user.resetPasswordOtp = otp;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    // Return token in response
    res.json({
      success: true,
      message: 'OTP sent to email. Use the token to verify OTP.',
      token: token, // return token here
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
};
  

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { token, otp } = req.body;
  
    try {
      // Verify JWT token and extract the OTP
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the OTP matches
      if (user.resetPasswordOtp !== parseInt(otp)) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
  
      // OTP is valid, now you can proceed to allow password reset
      res.json({ success: true, message: 'OTP verified, proceed to reset password' });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
    }
  };
  
// Reset Password
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Find the user by ID
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
      user.resetPasswordToken = null; // Clear the reset token
      user.resetPasswordOtp = null; // Clear the OTP
      await user.save();
  
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid or expired token', error: error.message });
    }
  };
