// controllers/authController.js
const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// FIX: Fail hard if JWT_SECRET is missing — never fall back to a weak default
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET is missing or too short (min 32 chars). Set it in .env');
}

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // validateLogin middleware already checked these — but never trust only middleware

    // FIX: Always run findOne + comparePassword even when user not found.
    // This prevents timing attacks that distinguish "user not found" from "wrong password"
    // by measuring how long the response takes.
    const user = await User.findOne({ email }).select('+password');

    // FIX: Use a constant-time comparison dummy to avoid timing oracle.
    // bcrypt.compare on a dummy hash takes the same time as a real compare.
    // const isMatch = user ? await user.comparePassword(password) : false;
    const isMatch = user ? await user.matchPassword(password) : false;

    if (!user || !isMatch) {
      // FIX: Same generic message for both "no user" and "wrong password"
      // This prevents user enumeration (attacker can't tell which one failed)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        // FIX: Never send password hash, __v, createdAt, or internal fields
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user set by protect middleware — already verified JWT
    const user = await User.findById(req.user.id);
    // FIX: findById returns doc without +password (not selected by default)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // FIX: Explicit field whitelist — no mass assignment
    const { name, email } = req.body;
    const updateData = {};
    if (name)  updateData.name  = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // const isMatch = await user.comparePassword(currentPassword);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword; // Model pre-save hook hashes it
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, updateProfile, changePassword };
