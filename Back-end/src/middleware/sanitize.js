/**
 * Express 5-compatible MongoDB body sanitizer.
 *
 * express-mongo-sanitize@2.2.0 crashes on Express 5 because it tries to
 * assign to req.query / req.params which are read-only getters in Express 5.
 * This replacement strips keys beginning with '$' or containing '.' from
 * req.body only — the attack surface for NoSQL injection via JSON POST bodies.
 *
 * req.query injection is mitigated at the controller level via strict enum
 * allowlists (see projectsController.js getProjects).
 */

const PROHIBITED = /^\$|\./

function sanitizeValue(val) {
  if (Array.isArray(val)) return val.map(sanitizeValue)
  if (val !== null && typeof val === 'object') return sanitizeObject(val)
  return val
}

function sanitizeObject(obj) {
  const out = {}
  for (const key of Object.keys(obj)) {
    if (!PROHIBITED.test(key)) out[key] = sanitizeValue(obj[key])
  }
  return out
}

module.exports = () => (req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body)
  next()
}
