// routes/auth.js
const express = require('express');
const router  = express.Router();
const { login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require('../middleware/validate');

// FIX: validateLogin sanitizes email + validates both fields before hitting the DB
router.post('/login', validateLogin, login);

router.get('/me', protect, getMe);

// FIX: validateUpdateProfile prevents injection via name/email fields
router.put('/update-profile', protect, validateUpdateProfile, updateProfile);

// FIX: validateChangePassword enforces strong password policy
router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
