// middleware/auth.js — FIXED
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Use .select('-password') explicitly — never accidentally attach password hash
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    // Let the centralized errorHandler format this
    next(err);
  }
};

module.exports = { protect };
