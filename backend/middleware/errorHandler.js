// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = 'Resource not found — invalid ID format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `Duplicate value for ${field}`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expired — please log in again';
  }

  // CORS errors
  if (err.message && err.message.includes('Not allowed by CORS')) {
    statusCode = 403;
    message    = 'CORS policy: origin not allowed';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // FIX: NEVER send stack trace in production — reveals internal paths,
    // library versions, and implementation details useful to attackers
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
