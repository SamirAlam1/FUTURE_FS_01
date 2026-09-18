require('dotenv').config()
const express       = require('express')
const cors          = require('cors')
const helmet        = require('helmet')
const morgan        = require('morgan')
const cookieParser  = require('cookie-parser')
const mongoSanitize = require('./middleware/sanitize')
const rateLimit     = require('express-rate-limit')
const loginThrottle = require('./middleware/loginThrottle')

const connectDB    = require('./config/db')
const routes       = require('./routes/index')
const errorHandler = require('./middleware/errorHandler')

const app    = express()
const PORT   = parseInt(process.env.PORT || '5000', 10)
const isProd = process.env.NODE_ENV === 'production'

// ─── Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      mediaSrc:   ["'self'"],
      frameSrc:   ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy:   { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy:            { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff:       true,
  xssFilter:     true,
  hidePoweredBy: true,
}))
app.disable('x-powered-by')

// Trust exactly one proxy hop (Render load balancer)
app.set('trust proxy', 1)

// ─── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // No Origin header = same-origin request forwarded by the Vercel edge proxy.
    // Browsers omit Origin on same-origin GETs; Vercel passes the request through
    // as-is. These are safe: the httpOnly cookie enforces session integrity and
    // the Vercel proxy only forwards requests from our own frontend domain.
    if (!origin) return cb(null, true)
    allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Rate limits ───────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}))

const ipLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts from this IP. Try again in 15 minutes.' },
})

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
})

// ─── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

// ─── Cookie parser ─────────────────────────────────────────────
app.use(cookieParser())

// ─── MongoDB body sanitiser ────────────────────────────────────
app.use(mongoSanitize())

// ─── Logging ───────────────────────────────────────────────────
app.use(isProd
  ? morgan('short', { skip: req => req.path === '/health' })
  : morgan('dev'))

// ─── Health ────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth/login', ipLoginLimiter, loginThrottle)
app.use('/api/contact',    contactLimiter)
app.use('/api', routes)

// ─── 404 ───────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }))

// ─── Error handler ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Start ─────────────────────────────────────────────────────
if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () =>
      console.log(`✓ Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)))
    .catch(err => { console.error('✗ DB connection failed:', err.message); process.exit(1) })
}

module.exports = app
