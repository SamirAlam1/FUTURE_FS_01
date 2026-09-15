/**
 * loginThrottle — two-layer brute-force protection for POST /api/auth/login
 *
 * WHY THIS EXISTS
 * ───────────────
 * The IP-level rate limiter in server.js (express-rate-limit, 10 req/15 min)
 * stops volumetric attacks from a single IP but does nothing against:
 *   • Distributed attacks: 1,000 IPs × 10 attempts = 10,000 tries on one account
 *   • Slow attacks: one attempt per 15 min from rotating IPs, indefinitely
 *
 * This middleware adds a second, orthogonal layer that tracks failures
 * per normalised email address, independent of the source IP.
 *
 * HOW IT WORKS
 * ────────────
 * Per-account in-memory store (Map) tracks:
 *   - consecutiveFails  : integer, incremented on every failed login
 *   - lockedUntil       : Date | null, set after MAX_FAILURES threshold
 *   - lastFailAt        : Date, drives TTL cleanup
 *
 * Before the login handler runs:
 *   1. If the account is in hard lockout → 429, no bcrypt, no timing info
 *   2. If consecutiveFails ≥ DELAY_AFTER → impose progressive delay before
 *      passing to the handler (slows distributed slow attacks)
 *
 * After the login handler runs (via res.on('finish')):
 *   3. On 2xx  → clear the account's failure record (reset lockout)
 *   4. On 4xx/5xx → increment failure count, possibly set lockout
 *
 * PROGRESSIVE DELAY TABLE (applied before bcrypt, additive to its ~100 ms)
 *   Fail #  Delay
 *   1–3     0 ms     (normal — user may just have mistyped)
 *   4       500 ms
 *   5       1 s
 *   6       2 s
 *   7       4 s
 *   8       8 s
 *   9+      15 s cap
 *
 * HARD LOCKOUT
 *   After MAX_FAILURES (10) consecutive failures the account is locked for
 *   LOCKOUT_DURATION (15 min). Requests during lockout are rejected with 429
 *   *before* bcrypt runs — making brute force economically pointless.
 *   A ±10 % timing jitter is added to both delay and lockout responses to
 *   prevent timing-based inference of which threshold was crossed.
 *
 * TTL CLEANUP
 *   A periodic sweep (every CLEANUP_INTERVAL) evicts entries that have not
 *   seen a failure in TTL ms, preventing unbounded memory growth.
 *
 * TRADE-OFFS / KNOWN LIMITATIONS
 *   • In-memory: state is per-process. A Render deployment with multiple
 *     replicas would give each replica its own counter. For a single-admin
 *     portfolio app on a single Render instance this is acceptable.
 *     If you ever scale out, replace the Map with a Redis store and use
 *     `rate-limit-redis` or `ioredis` — the interface here is compatible.
 *   • The lockout key is the *normalised email*. An attacker who doesn't
 *     know the admin email cannot trigger an account lockout by guessing.
 *     (The IP-layer limiter already caps unknown-email probing.)
 */

'use strict'

// ─── Configuration ─────────────────────────────────────────────────────────
const DELAY_AFTER      = 3          // start delaying after this many consecutive failures
const MAX_FAILURES     = 10         // hard lockout threshold
const LOCKOUT_DURATION = 15 * 60 * 1000  // 15 minutes in ms
const TTL              = 60 * 60 * 1000  // evict idle entries after 1 hour
const CLEANUP_INTERVAL = 10 * 60 * 1000 // run cleanup every 10 minutes
const JITTER           = 0.1        // ±10 % timing jitter factor

// Progressive delay schedule (ms) indexed by consecutiveFails - DELAY_AFTER
// Fails 1-3 → no delay; fail 4 → 500 ms; ... fail 9+ → 15 s cap
const DELAY_SCHEDULE = [500, 1000, 2000, 4000, 8000, 15000]

// ─── In-memory store ───────────────────────────────────────────────────────
// Map<normalisedEmail, { consecutiveFails, lockedUntil, lastFailAt }>
const store = new Map()

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Apply ±jitter to a duration so timing cannot be used to identify thresholds */
function withJitter(ms) {
  const spread = ms * JITTER
  return ms + (Math.random() * 2 * spread) - spread
}

/** Async sleep */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/** Normalise email to prevent trivial bypass via case/whitespace variation */
function normaliseEmail(raw) {
  return (raw || '').toLowerCase().trim()
}

/** Return the store entry for an email, or null if none exists */
function getEntry(email) {
  return store.get(email) ?? null
}

/** Record a failed attempt; set lockout if threshold crossed */
function recordFailure(email) {
  if (!store.has(email)) {
    store.set(email, { consecutiveFails: 0, lockedUntil: null, lastFailAt: null })
  }
  const entry = store.get(email)
  entry.consecutiveFails += 1
  entry.lastFailAt = new Date()
  if (entry.consecutiveFails >= MAX_FAILURES) {
    entry.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
  }
}

/** Clear failure record on successful login */
function recordSuccess(email) {
  store.delete(email)
}

/** Calculate progressive delay for current failure count (0 if below threshold) */
function delayFor(consecutiveFails) {
  if (consecutiveFails < DELAY_AFTER) return 0
  const idx = Math.min(consecutiveFails - DELAY_AFTER, DELAY_SCHEDULE.length - 1)
  return DELAY_SCHEDULE[idx]
}

// ─── TTL cleanup ───────────────────────────────────────────────────────────
const cleanup = () => {
  const cutoff = Date.now() - TTL
  for (const [email, entry] of store) {
    // Only evict if no active lockout and entry is idle
    const isLockedOut = entry.lockedUntil && entry.lockedUntil > new Date()
    if (!isLockedOut && entry.lastFailAt && entry.lastFailAt.getTime() < cutoff) {
      store.delete(email)
    }
  }
}

// Run cleanup on a timer; unref() so it doesn't keep the process alive in tests
const cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL)
if (cleanupTimer.unref) cleanupTimer.unref()

// ─── Middleware ─────────────────────────────────────────────────────────────
const loginThrottle = async (req, res, next) => {
  // Only act on POST (the login route is already mounted on POST only, but be explicit)
  if (req.method !== 'POST') return next()

  // Extract and normalise the email from the request body.
  // At this point body parsing has already run (cookieParser and express.json
  // are upstream), so req.body.email is available.
  const email = normaliseEmail(req.body?.email)

  // If no email in body, fall through — the login handler validates and rejects it
  if (!email) return next()

  const entry = getEntry(email)
  const now   = Date.now()

  // ── Layer: hard lockout ──────────────────────────────────────
  if (entry && entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSec = Math.ceil((entry.lockedUntil - now) / 1000)
    // Add jitter so attacker cannot infer exact reset time
    await sleep(withJitter(200))
    res.set('Retry-After', retryAfterSec)
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked due to too many failed attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
    })
  }

  // ── Layer: progressive delay ──────────────────────────────────
  const delay = delayFor(entry ? entry.consecutiveFails : 0)
  if (delay > 0) await sleep(withJitter(delay))

  // ── Hook: record result after handler responds ────────────────
  // res.on('finish') fires after the response is sent, giving us the
  // final status code without interfering with the response itself.
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      recordSuccess(email)
    } else if (res.statusCode === 400 || res.statusCode === 401) {
      // Only count genuine credential failures, not malformed requests (400)
      // Actually count 401 only — 400 means bad input, not wrong password
      if (res.statusCode === 401) recordFailure(email)
    }
    // 429 from the IP limiter upstream: don't double-count
  })

  next()
}

// Export for testing
loginThrottle._store    = store
loginThrottle._recordSuccess = recordSuccess
loginThrottle._recordFailure = recordFailure

module.exports = loginThrottle
