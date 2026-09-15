const Admin  = require('../models/Admin')
const bcrypt = require('bcryptjs')
const { sign } = require('../config/jwt')

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DUMMY_HASH     = '$2a$12$invalidhashfortimingprotectiononly00000000000000000000'

// ─── Cookie helper ────────────────────────────────────────────
// Writes an httpOnly auth cookie. The cookie name is 'admin_token'.
// SameSite=None + Secure is required because the frontend (Vercel) and
// backend (Render) run on different origins in production.
// In development we relax Secure so the cookie works over plain HTTP.
const TOKEN_COOKIE = 'admin_token'

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly : true,          // JS cannot read this cookie — blocks XSS token theft
    secure   : isProd,        // HTTPS only in production
    sameSite : isProd ? 'none' : 'lax', // 'none' required for cross-origin (Vercel↔Render)
    maxAge   : 24 * 60 * 60 * 1000,    // 1 day, matches JWT expiry
    path     : '/',
  })
}

function clearAuthCookie(res) {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly : true,
    secure   : isProd,
    sameSite : isProd ? 'none' : 'lax',
    path     : '/',
  })
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ success: false, message: 'Email and password are required' })

    if (!EMAIL_REGEX.test(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email format' })

    if (password.length > 128)
      return res.status(400).json({ success: false, message: 'Invalid credentials' })

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password')

    // Always run bcrypt regardless of whether the account exists (timing-safe)
    const passwordMatch = admin
      ? await admin.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH)

    if (!admin || !passwordMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const token = sign({ id: admin._id, email: admin.email })

    // Set httpOnly cookie — token never exposed to JavaScript
    setAuthCookie(res, token)

    res.json({ success: true, admin: { id: admin._id, email: admin.email } })
  } catch (err) { next(err) }
}

// POST /api/auth/logout
const logout = (_req, res) => {
  clearAuthCookie(res)
  res.json({ success: true, message: 'Logged out' })
}

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id)
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
    res.json({ success: true, admin })
  } catch (err) { next(err) }
}

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (
      !currentPassword || !newPassword ||
      typeof currentPassword !== 'string' || typeof newPassword !== 'string'
    ) return res.status(400).json({ success: false, message: 'Both passwords are required' })

    if (currentPassword.length > 128 || newPassword.length > 128)
      return res.status(400).json({ success: false, message: 'Password too long' })

    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: 'New password must differ from the current password' })

    if (!PASSWORD_REGEX.test(newPassword))
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and contain uppercase, lowercase, and a digit',
      })

    const admin = await Admin.findById(req.admin.id).select('+password')
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })

    if (!(await admin.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })

    // pre-save hook hashes password + bumps passwordChangedAt (invalidates all other tokens)
    admin.password = newPassword
    await admin.save()

    // Refresh the cookie so current session stays alive
    const token = sign({ id: admin._id, email: admin.email })
    setAuthCookie(res, token)

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) { next(err) }
}

module.exports = { login, logout, getMe, changePassword }
