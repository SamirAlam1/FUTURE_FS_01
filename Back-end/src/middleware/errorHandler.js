const isProd = process.env.NODE_ENV === 'production'

const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || err.status || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map(e => e.message).join('; ')
  }
  // Mongoose bad ObjectId — never expose raw user-controlled value
  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path} format` }
  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409
    message = `${Object.keys(err.keyValue || {})[0] || 'Field'} already exists`
  }
  // JWT
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token' }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Session expired — please sign in again' }
  if (err.name === 'NotBeforeError')    { status = 401; message = 'Token not active yet' }
  // CORS
  if (typeof message === 'string' && message.startsWith('CORS:')) { status = 403; message = 'Blocked by CORS policy' }

  // Never leak internal details in production
  if (isProd && status >= 500) message = 'An internal error occurred. Please try again later.'

  if (status >= 500) {
    console.error(`[ERROR ${status}] ${req.method} ${req.path}`)
    if (!isProd && err.stack) console.error(err.stack)
  } else if (!isProd) {
    console.warn(`[${status}] ${req.method} ${req.path} — ${message}`)
  }

  res.status(status).json({
    success: false,
    message,
    ...(!isProd && err.stack ? { stack: err.stack } : {}),
  })
}

module.exports = errorHandler
