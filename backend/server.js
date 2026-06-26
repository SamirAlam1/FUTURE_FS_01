const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const dotenv     = require('dotenv');
const helmet     = require('helmet');           // FIX: Security headers
const rateLimit  = require('express-rate-limit'); // FIX: Rate limiting
const mongoSanitize = require('express-mongo-sanitize'); // FIX: NoSQL injection
const hpp        = require('hpp');               // FIX: HTTP param pollution

const connectDB      = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// ─── 1. HELMET — Security HTTP headers ──────────────────────────────────────
// Adds: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.
app.use(helmet());

// ─── 2. CORS — Strict origin whitelist only ──────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin only in development (curl/Postman local)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── 3. Body parsers ─────────────────────────────────────────────────────────
// FIX: Add size limits to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── 4. NoSQL Injection sanitization ────────────────────────────────────────
// Strips $ and . from request body, query, params
// e.g. { "email": { "$gt": "" } } attack is blocked
app.use(mongoSanitize());

// ─── 5. HTTP Parameter Pollution prevention ──────────────────────────────────
app.use(hpp());

// ─── 6. Request logging (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── 7. Global rate limiter (all routes) ─────────────────────────────────────
// 100 requests per 15 minutes per IP — general protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// ─── 8. Stricter rate limit for /api/auth/login ──────────────────────────────
// 10 login attempts per 15 minutes per IP — brute force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// ─── 9. Stricter rate limit for /api/messages (contact form) ─────────────────
// 5 submissions per hour per IP — spam protection
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent. Please wait before sending again.' },
});

// ─── 10. Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',      loginLimiter,   require('./routes/auth'));
app.use('/api/messages',  messageLimiter, require('./routes/messages'));
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/skills',    require('./routes/skills'));
app.use('/api/education', require('./routes/education'));
app.use('/api/certifications',  require('./routes/certifications'));

// ─── SEED ROUTE REMOVED FROM PRODUCTION ──────────────────────────────────────
// FIX: /api/seed route is intentionally NOT mounted here.
// Run seeding locally: node utils/seed.js
// Never expose seed routes in production.

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
  // FIX: Removed environment/mode info from health response
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  // FIX: Removed sensitive info from console.log in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});
