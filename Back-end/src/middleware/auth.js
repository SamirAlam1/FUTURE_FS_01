const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const TOKEN_COOKIE = 'admin_token'
const JWT_ALGORITHM = 'HS256'

const unauthorized = (res, message = 'Not authorised') =>
  res.status(401).json({ success: false, message })

const protect = async (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE]

  if (!token)
    return unauthorized(res, 'Not authorised — no session')

  const secret = process.env.JWT_SECRET

  if (!secret) {
    console.error('[FATAL] JWT_SECRET is not set')
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }

  let decoded

  try {
    decoded = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return unauthorized(res, 'Session expired — please sign in again')

    if (err.name === 'NotBeforeError')
      return unauthorized(res, 'Token not yet active')

    return unauthorized(res, 'Not authorised — invalid token')
  }

  if (!decoded?.id || !decoded?.email)
    return unauthorized(res, 'Not authorised — invalid token claims')

  try {
    const admin = await Admin.findById(decoded.id)
      .select('+passwordChangedAt')
      .lean()

    if (!admin)
      return unauthorized(res, 'Not authorised — account not found')

    if (admin.passwordChangedAt && decoded.iat) {
      const changedAt = Math.floor(
        new Date(admin.passwordChangedAt).getTime() / 1000
      )

      if (decoded.iat < changedAt)
        return unauthorized(
          res,
          'Password was changed — please sign in again'
        )
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { protect }