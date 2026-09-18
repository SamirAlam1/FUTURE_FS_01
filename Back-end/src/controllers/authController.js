const Admin = require('../models/Admin')
const bcrypt = require('bcryptjs')
const { sign } = require('../config/jwt')

const TOKEN_COOKIE = 'admin_token'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const DUMMY_HASH = '$2a$12$invalidhashfortimingprotectiononly00000000000000000000'

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 86400000,
  path: '/',
})

const setAuthCookie = (res, token) =>
  res.cookie(TOKEN_COOKIE, token, cookieOptions())

const clearAuthCookie = (res) =>
  res.clearCookie(TOKEN_COOKIE, cookieOptions())

const createToken = (admin) =>
  sign({ id: admin._id, email: admin.email })

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email ||
      !password
    )
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })

    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail) || password.length > 128)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      })

    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password')
    const valid = admin
      ? await admin.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH)

    if (!admin || !valid)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })

    setAuthCookie(res, createToken(admin))

    res.json({
      success: true,
      admin: { id: admin._id, email: admin.email },
    })
  } catch (err) {
    next(err)
  }
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

    if (!admin)
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })

    res.json({ success: true, admin })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword ||
      !newPassword
    )
      return res.status(400).json({
        success: false,
        message: 'Both passwords are required',
      })

    if (
      currentPassword.length > 128 ||
      newPassword.length > 128 ||
      currentPassword === newPassword
    )
      return res.status(400).json({
        success: false,
        message: currentPassword === newPassword
          ? 'New password must differ from the current password'
          : 'Password too long',
      })

    if (!PASSWORD_REGEX.test(newPassword))
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters and contain uppercase, lowercase, and a digit',
      })

    const admin = await Admin.findById(req.admin.id).select('+password')

    if (!admin)
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })

    if (!(await admin.comparePassword(currentPassword)))
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })

    admin.password = newPassword
    await admin.save()

    setAuthCookie(res, createToken(admin))

    res.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, logout, getMe, changePassword }