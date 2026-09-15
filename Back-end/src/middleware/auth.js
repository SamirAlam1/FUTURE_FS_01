const jwt   = require('jsonwebtoken')
const Admin = require('../models/Admin')

const ACCEPTED_ALGORITHMS = ['HS256']
const TOKEN_COOKIE        = 'admin_token'

const protect = async (req, res, next) => {
  // ── 1. Extract token from httpOnly cookie ───────────────────────────
  // The token lives exclusively in the admin_token httpOnly cookie.
  // No Bearer header fallback — removing it eliminates the residual attack
  // surface noted in W3. The Vite dev proxy forwards /api/* to the backend
  // on the same connection, so the cookie is sent correctly in development too.
  const token = req.cookies?.[TOKEN_COOKIE]

  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorised — no session' })

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('[FATAL] JWT_SECRET is not set')
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }

  // ── 2. Verify signature and algorithm ────────────────────────────────
  let decoded
  try {
    decoded = jwt.verify(token, secret, { algorithms: ACCEPTED_ALGORITHMS })
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Session expired — please sign in again' })
    if (err.name === 'NotBeforeError')
      return res.status(401).json({ success: false, message: 'Token not yet active' })
    return res.status(401).json({ success: false, message: 'Not authorised — invalid token' })
  }

  if (!decoded.id || !decoded.email)
    return res.status(401).json({ success: false, message: 'Not authorised — invalid token claims' })

  // ── 3. Reject tokens issued before last password change (M-4) ────────
  const admin = await Admin.findById(decoded.id).select('+passwordChangedAt').lean().catch(() => null)
  if (!admin)
    return res.status(401).json({ success: false, message: 'Not authorised — account not found' })

  if (admin.passwordChangedAt) {
    const changedAt = Math.floor(new Date(admin.passwordChangedAt).getTime() / 1000)
    if (decoded.iat < changedAt)
      return res.status(401).json({ success: false, message: 'Password was changed — please sign in again' })
  }

  req.admin = decoded
  next()
}

module.exports = { protect }
