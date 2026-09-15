# Security & Threat Model

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 2.0 — Post-audit hardened  
**Status:** Reflects current codebase after full security audit and remediation

---

## 1. Trust Boundaries

```
[Internet / Untrusted]
        │
        ▼
  ┌─────────────────────────┐
  │   CDN / Reverse Proxy   │  (Vercel / Render edge)
  │   TLS termination        │
  └────────────┬────────────┘
               │ HTTPS
               ▼
  ┌────────────────────────────────────────────────────┐
  │              Express API (Node.js)                  │
  │                                                    │
  │  Helmet → CORS → Global limiter → IP login limiter │
  │  → Account throttle → Body parser → Cookie parser  │
  │  → Mongo sanitise → protect (JWT+cookie) → Route  │
  └────────────────────┬───────────────────────────────┘
                       │ Mongoose ODM (TLS)
                       ▼
              ┌──────────────────┐
              │     MongoDB      │   [Trusted boundary]
              └──────────────────┘
```

---

## 2. Assets and Sensitivity

| Asset | Sensitivity | Location | Protection |
|-------|-------------|----------|------------|
| Admin password | Critical | MongoDB `admins.password` | bcrypt hash (cost 12); `select:false`; stripped from all JSON |
| JWT secret | Critical | Server environment variable | Min 32 chars enforced at startup; never logged |
| JWT token | High | httpOnly cookie `admin_token` | Not readable by JS; `Secure; SameSite=None`; 1-day expiry |
| `passwordChangedAt` | Medium | MongoDB `admins.passwordChangedAt` | `select:false`; stripped from all JSON; invalidates pre-change tokens |
| MongoDB URI | Critical | Server environment variable | Not in source code; not logged |
| Contact messages | Medium | MongoDB `messages` | Admin-only; IP stored for abuse tracking; HTML-stripped before storage |
| Admin email | Low | MongoDB `admins.email` | Not exposed publicly |

---

## 3. Threat Model (STRIDE)

### 3.1 Spoofing

| Threat | Vector | Control |
|--------|--------|---------|
| Single-IP brute force | Guessing password from one IP | IP-level login limiter: 10 failures / 15 min per IP (`skipSuccessfulRequests:true`) |
| Distributed brute force | 1,000 IPs × 10 attempts on one account | Account-level throttle: progressive delay 500 ms→15 s; hard 15-min lockout at 10 failures |
| Case/whitespace bypass of throttle | `Admin@Example.COM` vs `admin@example.com` | Email normalised to lowercase+trim before throttle lookup |
| JWT forgery | Crafting a token without the secret | `jwt.verify()` with explicit `algorithms: ['HS256']` (blocks `alg:none` and RS256/HS256 confusion) |
| Algorithm confusion | Using RS256 public key as HS256 secret | Algorithm pinned in both `jwt.js` and `middleware/auth.js` |
| CORS bypass | Sending requests from unlisted origins | Allowlist-based CORS; never wildcard; requests without Origin blocked in production |
| Replay of pre-change token | Using a stolen token after password change | `protect` rejects tokens with `iat < passwordChangedAt`; password change immediately issues new cookie |

### 3.2 Tampering

| Threat | Vector | Control |
|--------|--------|---------|
| NoSQL injection via body | `{ "$where": "..." }` in JSON | Custom sanitizer strips `$` and `.` keys from `req.body` |
| NoSQL injection via query string | `?category[$ne]=null` | Controller validates `req.query.category` against explicit enum allowlist before querying |
| Request body overflow | Sending 100MB JSON to exhaust memory | `express.json({ limit: '10kb' })` |
| Mass assignment | Sending `_id` or internal fields in create/update body | `pick()` function in every write controller; only whitelisted fields reach Mongoose |
| Stored XSS via contact messages | `<script>` in name/subject/message | HTML tags stripped (`stripHtml()`) in controller before `Message.create()` |
| URL injection in project fields | `javascript:alert(1)` in `liveUrl`/`githubUrl`/`image` | Mongoose validators require `http://` or `https://` prefix |

### 3.3 Repudiation

| Threat | Vector | Control |
|--------|--------|---------|
| Contact spam | Bulk form submissions | Contact limiter: 5 / hour per IP; IP stored on message document |
| Admin action denial | Admin denying they made a change | `updatedAt` timestamps on all documents |

### 3.4 Information Disclosure

| Threat | Vector | Control |
|--------|--------|---------|
| Password in API response | Admin model serialisation | `toJSON` deletes `password` and `passwordChangedAt`; `select('+password')` only in auth controller |
| Stack trace in production | Unhandled error response | `errorHandler` omits `stack` when `NODE_ENV=production`; generic 5xx message |
| Internal error details | CastError / ValidationError messages | CastError only exposes field path, not raw value; 5xx messages are generic in prod |
| Secret leakage via logs | Logging `req.body` | `morgan` logs only method, URL, status; never body |
| Secret in frontend bundle | Hardcoded credentials in React code | No secrets in frontend; only `VITE_API_URL` is public |
| Token in login response | `{ token: "eyJ..." }` in JSON | Login response never includes token; token set as httpOnly cookie only |
| MongoDB host in error logs | Connection error output | Production logs only "MongoDB connected", not the host |
| Admin routes indexed by search engine | Google crawling `/admin/login` | `robots.txt` disallows `/admin` and `/admin/` |

### 3.5 Denial of Service

| Threat | Vector | Control |
|--------|--------|---------|
| Request flooding | High-volume API calls | Global limiter: 300 req / 15 min per IP |
| Single-IP login flooding | Credential stuffing from one IP | IP login limiter: 10 failures / 15 min |
| Distributed login flooding | Many IPs, one account | Account throttle: 15-min lockout after 10 consecutive failures |
| Contact form flooding | Spam submissions | Contact limiter: 5 req / hour per IP |
| Large body attack | Sending huge JSON payloads | Body parser limit: 10 KB |
| bcrypt DoS via long password | Sending 10,000-char password | Password length capped at 128 chars before bcrypt runs |
| Throttle memory exhaustion | Infinite unique email probes | TTL cleanup: idle entries evicted after 1 hour; runs every 10 min |

### 3.6 Elevation of Privilege

| Threat | Vector | Control |
|--------|--------|---------|
| Unauthenticated admin access | Calling `/api/admin/*` without session | `protect` middleware: reads cookie → verifies JWT → checks `passwordChangedAt` |
| Frontend route bypass | Navigating to `/admin/dashboard` without session | `AdminLayout` calls `GET /auth/me` on every mount; non-200 → redirect to login |
| XSS → token theft | Injecting script that reads auth token | Token is in httpOnly cookie — inaccessible to `document.cookie` or JS |
| CSRF | Forging a request from another site | Cookie `SameSite=None` with `credentials:include` requires explicit opt-in; logout is POST |

---

## 4. Security Controls (Implemented)

| Control | Implementation | Details |
|---------|----------------|---------|
| Security headers | `helmet()` | CSP, HSTS (1 year + preload), X-Frame-Options, noSniff, referrer policy |
| CORS | Origin allowlist from `FRONTEND_URL` | `credentials: true`; no wildcard; blocks no-origin in production |
| Rate limiting — global | `express-rate-limit` | 300 req / 15 min per IP |
| Rate limiting — IP login | `express-rate-limit` | 10 failures / 15 min; `skipSuccessfulRequests: true` |
| Rate limiting — account login | Custom `loginThrottle.js` | Progressive delay + hard lockout; email normalisation; TTL cleanup |
| Rate limiting — contact | `express-rate-limit` | 5 req / hour per IP |
| NoSQL injection prevention | Custom `sanitize.js` | Strips `$`/`.` keys from `req.body` (Express 5 compatible) |
| Query injection prevention | Controller allowlists | `req.query` validated against enum before reaching Mongoose |
| Body size limit | `express.json({ limit: '10kb' })` | Rejects large payloads |
| Stored XSS prevention | `stripHtml()` in messagesController | HTML stripped from all contact form fields before DB write |
| URL injection prevention | Mongoose validators | `http(s)://` required for all URL fields in Project and Certification models |
| Mass assignment prevention | `pick()` in all write controllers | Only explicitly whitelisted fields reach Mongoose |
| Password hashing | bcrypt, cost 12 | `bcryptjs`; timing-safe comparison; dummy hash for non-existent accounts |
| JWT authentication | HS256, explicit algorithm | `jsonwebtoken 9.x`; `algorithms: ['HS256']` in both sign and verify |
| JWT secret strength | Min 32 chars enforced | `jwt.js` throws at startup if secret is too short |
| Token storage | httpOnly cookie | `Secure; SameSite=None` in production; JS cannot read |
| Token expiry | 1 day | Cookie `maxAge` aligned with JWT `expiresIn` |
| Token invalidation | `passwordChangedAt` + `iat` check | Pre-change tokens rejected immediately on next request |
| Session verification | `GET /auth/me` on layout mount | Server-side check on every admin page load |
| Server-side logout | `POST /auth/logout` clears cookie | Cookie cleared with `Max-Age=0`; cannot be done by JS alone |
| Field selection | `select: false` on sensitive fields | `password` and `passwordChangedAt` excluded from all queries by default |
| JSON serialisation safety | `toJSON` method on Admin | Explicitly deletes sensitive fields before any serialisation |
| Transport security | HTTPS via Vercel/Render | HSTS header set by Helmet (production) |
| Secret management | Environment variables only | `.env` excluded from git; `.env.example` has placeholders only |

---

## 5. Known Limitations (Accepted)

| Limitation | Risk | Notes |
|-----------|------|-------|
| In-memory throttle store | Low | State is per-process. On multi-instance Render deployment, each instance has its own counter. Acceptable for single-admin portfolio on a single Render instance. Upgrade path: Redis-backed store. |
| No server-side token blacklist | Low | Logout clears the cookie regardless of token expiry (`logout` no longer requires `protect`). A stolen token valid up to 1 day; mitigated by short expiry and `passwordChangedAt` invalidation. |
| ~~Bearer header fallback in `protect`~~ | ~~Informational~~ | **Fixed** — Bearer fallback removed. Cookie is the sole accepted credential. Vite dev proxy forwards cookies correctly without a fallback. |
| No CSRF token | Informational | `SameSite=None` with explicit `credentials:include` is the opt-in mechanism; logout is POST. |
| Single admin account | Informational | No recovery flow. Re-run seed script if password lost. |
| No email verification on contact form | Informational | Rate limiter + IP logging mitigates spam. |

---

## 6. Security Checklist for Production

- [ ] `JWT_SECRET` generated with `openssl rand -base64 64` (≥ 32 chars, server enforces)
- [ ] `NODE_ENV=production` on backend
- [ ] `FRONTEND_URL` = exact deployed frontend URL (no trailing slash)
- [ ] MongoDB Atlas: IP allowlist restricted to Render server IPs
- [ ] MongoDB Atlas: database user has `readWrite` on `portfolio` only
- [ ] Admin password meets complexity rule (uppercase + lowercase + digit + 8+ chars)
- [ ] `robots.txt` blocks `/admin` (already committed)
- [ ] Verify no secrets in dist bundle: `grep -r "JWT\|SECRET\|MONGO" dist/`
- [ ] Run `npm audit` in both `Front-end/` and `Back-end/`
- [ ] Cookie attributes confirmed in browser DevTools: `HttpOnly ✓`, `Secure ✓`, `SameSite=None ✓`
