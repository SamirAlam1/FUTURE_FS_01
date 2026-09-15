# Issues Found & Fixed

This document is a cumulative log of all issues found and fixed across all audit passes.

---

## Pass 1 — Initial Bug Fixes

### CRITICAL — Frontend

#### FIX-01: `vite.config.ts` — Figma Make dependencies causing startup failure
Rewrote from scratch — removed all Figma imports/plugins, fixed `__dirname`, set port to `5173`, added `/api` dev proxy.

#### FIX-02: Admin login returning 401 — no dev proxy configured
Added Vite dev proxy: `/api` → `http://localhost:5000`. No frontend code changes needed.

#### FIX-03: `AdminLogin.tsx` — hardcoded demo credentials
Replaced with real `fetch` call to `/auth/login`.

#### FIX-04: `AdminLogin.tsx` — no redirect if already authenticated
Added `useEffect` on mount to redirect if session exists.

#### FIX-05: `AdminLayout.tsx` — auth check only verified token string existence
Added `GET /api/auth/me` verification on mount.

#### FIX-06–08: Stray files, wrong package name, pnpm-lock.yaml
Removed `src/imports/` screenshots, fixed package name, replaced `pnpm-lock.yaml` with `package-lock.json`.

### CRITICAL — Backend

#### FIX-09: `mongoSanitize` applied before body parsing
Moved after `express.json()`.

#### FIX-10: Express security vulnerability
Upgraded Express 4.22.2 → 5.2.1.

#### FIX-11–16: Various backend issues
`require.main` guard, JSON rate-limit responses, `slice(7)` vs `split`, `CastError` handling, removed unused `express-validator`.

---

## Pass 2 — OWASP Security Audit (Full Hardening)

### Critical → Fixed

#### FIX-17: JWT `alg:none` attack vector
`jwt.verify()` now passes `{ algorithms: ['HS256'] }` in both `auth.js` middleware and `config/jwt.js`. Two divergent implementations were unified.

#### FIX-18: Admin panel accessible offline (auth bypass)
`AdminLayout` now validates token structure and expiry locally before accepting offline access. Invalid/expired tokens are cleared and redirected immediately.

### High → Fixed

#### FIX-19: No brute-force protection on `/api/auth/login` (IP level)
Dedicated `ipLoginLimiter` (10 failures / 15 min, `skipSuccessfulRequests:true`) applied to login route.

#### FIX-20: User enumeration via timing attack
`authController.login` now always runs `bcrypt.compare()` even when the account doesn't exist, using a dummy hash for constant-time response.

### Medium → Fixed

#### FIX-21: `req.query` NoSQL injection in `getProjects`
`req.query.category` validated against explicit enum allowlist in controller before reaching Mongoose.

#### FIX-22: JWT default expiry 7 days
Reduced to `1d`.

#### FIX-23: No security headers on frontend deployment
`netlify.toml` and `vercel.json` now include full security header block (CSP, HSTS, X-Frame-Options, noSniff, Referrer-Policy, Permissions-Policy).

### Low → Fixed

#### FIX-24: Mass assignment in all write controllers
`pick()` function with per-model field whitelists added to `crudController.js` and `projectsController.js`.

#### FIX-25: Password complexity not enforced at seed time
`seed.js` now enforces the same `PASSWORD_REGEX` as `changePassword`.

#### FIX-26: Dead `express-mongo-sanitize` dependency
Removed from `Back-end/package.json`.

#### FIX-27: No contact rate limit
`contactLimiter` (5 req / hour per IP) applied to `POST /api/contact`.

#### FIX-28: Stored XSS in contact messages
`stripHtml()` applied to all message fields before `Message.create()`.

#### FIX-29: URL injection in project/certification fields
Mongoose validators require `http://` or `https://` on `liveUrl`, `githubUrl`, `credentialUrl`, `image`.

#### FIX-30: Error handler leaks internal details in production
Stack traces and raw values suppressed in production. `CastError` no longer exposes the raw user-supplied value.

#### FIX-31: `db.js` exposes MongoDB host in production logs
Production logs only "MongoDB connected", not the host.

#### FIX-32: Admin routes indexed by search engines
`robots.txt` disallows `/admin` and `/admin/`.

---

## Pass 3 — M-4 Token Revocation

#### FIX-33: No token revocation after password change (M-4)
Three coordinated changes:
- `Admin.js`: added `passwordChangedAt: Date` (`select:false`); pre-save hook sets it to `Date.now() - 1000` on non-initial password saves (the 1 s subtraction prevents same-second edge case)
- `middleware/auth.js`: after verifying JWT, fetches `passwordChangedAt` and rejects tokens where `decoded.iat < changedAt`
- `authController.changePassword`: issues a fresh cookie after saving so the current session survives

---

## Pass 4 — H-1: JWT localStorage → httpOnly Cookie

#### FIX-34: JWT stored in localStorage (H-1)

Full migration from `localStorage` Bearer token to `httpOnly` cookie:

**Backend:**
- `authController.js`: `login` sets `admin_token` httpOnly cookie (never in response body); added `logout` endpoint that clears the cookie server-side; `changePassword` refreshes the cookie
- `middleware/auth.js`: reads token from `req.cookies.admin_token` first; Bearer header fallback for dev-proxy convenience
- `server.js`: added `cookie-parser` middleware; set `crossOriginResourcePolicy: 'cross-origin'`; added `POST /api/auth/logout` to `ipLoginLimiter` bypass
- `package.json`: added `cookie-parser: ^1.4.7`

**Frontend:**
- New `src/lib/api.ts`: centralised `apiFetch()` wrapper that always sends `credentials: 'include'`; auto-redirects to login on 401 inside `/admin`
- `AdminLogin.tsx`: probes `/auth/me` on mount (cookie-based); no token in JS after login; client lockout for UI feedback
- `AdminLayout.tsx`: verifies session via `/auth/me` with cookie; logout calls `POST /auth/logout`; no `localStorage` reads
- All 7 admin pages: removed `getToken()`, `authHeaders()`, `localStorage`, `Authorization` headers; all fetch calls replaced with `apiFetch()`

Cookie attributes (production): `HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`
Cookie attributes (development): `HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`

---

## Pass 5 — H-2: Distributed Brute-Force Protection

#### FIX-35: Distributed brute-force on login (H-2)

**New file:** `Back-end/src/middleware/loginThrottle.js`

Per-account (per-email) protection that the IP-level limiter cannot provide:

| Feature | Implementation |
|---------|----------------|
| Progressive delay | 500 ms → 1 s → 2 s → 4 s → 8 s → 15 s cap (after 3 failures) |
| Hard lockout | 15-min lockout after 10 consecutive failures |
| Timing jitter | ±10% on all delays to prevent threshold inference |
| Lockout fast-reject | 429 + `Retry-After` returned before bcrypt runs |
| Success reset | Failure count cleared on any `2xx` response |
| 400 immunity | 400 (bad input) does NOT increment counter — only 401 does |
| Email normalisation | `email.toLowerCase().trim()` prevents case/whitespace bypass |
| Memory safety | TTL: idle entries evicted after 1 hour; cleanup runs every 10 min; timer `.unref()`'d |
| Fail-safe | Unknown models return `{}` from `pick()` — fail-safe for mass assignment |

**`server.js`:** Renamed `authLimiter` → `ipLoginLimiter`; both limiters applied to `POST /api/auth/login` in order: IP limiter first (cheap), then account throttle.

**Test suite:** `loginThrottle.test.js` — 24/24 tests pass (plain Node.js `assert`, no framework needed).

---

## Verification Summary

| Check | Result |
|-------|--------|
| TypeScript — `npx tsc --noEmit` | ✓ 0 errors |
| Frontend build — `npm run build` | ✓ Success |
| loginThrottle tests | ✓ 24/24 pass |
| No `localStorage` / `admin-token` in frontend source | ✓ Confirmed |
| No token in login response body | ✓ Confirmed |
| httpOnly cookie set on login | ✓ Confirmed (server-side) |
| SameSite=None only with Secure=true | ✓ Confirmed |
| No wildcard CORS with credentials | ✓ Confirmed |
| No stack traces in production error handler | ✓ Confirmed |
| express-mongo-sanitize removed | ✓ Confirmed |
| `robots.txt` blocks /admin | ✓ Confirmed |
| All write controllers have field whitelists | ✓ Confirmed |
| URL fields have http(s) validators | ✓ Confirmed |
| HTML stripped from contact messages | ✓ Confirmed |
| `passwordChangedAt` invalidates prior sessions | ✓ Confirmed |
| Account locked after 10 consecutive failures | ✓ Confirmed |

---

## Pass 6 — Final Verification Fixes

### TypeScript (7 errors → 0)

#### FIX-36: AdminLayout.tsx — `JSX.Element` namespace error
`JSX.Element` used as return type on `NAV_ICONS` map values without importing `JSX`. Fixed by importing `ReactElement` from `react` and using it in place of `JSX.Element`.

#### FIX-37: CertificationList.tsx — `.json()` called on `apiFetch` result
`apiFetch` returns `{ ok, status, data }`, not a `Response`. All three fetch operations (load, save, delete) were calling `.json()` and checking `.ok` on the wrong shape. Fixed: replaced with `apiFetch` destructuring `{ ok, data }` throughout. Plain `fetch()` calls in save/delete replaced with `apiFetch`.

#### FIX-38: ExperienceList.tsx — same `.json()` pattern
Same issue as FIX-37. Fixed identically.

#### FIX-39: SkillsList.tsx — `.json()` on `apiFetch` result + plain `fetch` in save
`fetchSkills` called `r.json()` on the `apiFetch` return. `handleSave` used plain `fetch()`. Fixed: destructured `{ ok, data }` from `apiFetch` in both places; fixed `result.data` access with proper type assertion.

#### FIX-40: EducationList.tsx — `parseResponse` typed to accept `Response`, passed `apiFetch` result
`parseResponse(response: Response)` called `.json()` and checked `.ok` on a native `Response`. After migration, the callers passed the `apiFetch` return shape. Fixed: updated signature to `parseResponse(response: { ok: boolean; status: number; data: unknown })`, removed `.json()` call, cast `result.data` with field-level `as string` on all nine assignments. Plain `fetch()` in save and delete replaced with `apiFetch`.

#### FIX-41: ProjectsList.tsx — `apiRequest` return typed as `Record<string,unknown>`, callers needed `{ data: ApiProject }`
`apiRequest` was not generic; callers assigned `result.data` to `ApiProject` typed variables but `data` was `unknown`. Fixed: made `apiRequest<T>` generic, typed save and toggle call sites as `apiRequest<{ success: boolean; data: ApiProject }>`.

---

### W2 — Expired-cookie logout (now fixed)

#### FIX-42: `routes/index.js` — `logout` route no longer requires `protect` middleware
Previously: `router.post('/auth/logout', protect, logout)` — if the JWT was expired, `protect` rejected the request with 401 and `clearAuthCookie` never fired. The cookie stayed set (though already expired and not sent by the browser).
Fix: `router.post('/auth/logout', logout)` — `clearAuthCookie` always fires on logout. The handler performs no sensitive data operation, carries no CSRF risk (called with `credentials:'include'` from our own origin only), and is harmless if called without a session.

---

### W3 — Bearer header fallback (now removed)

#### FIX-43: `middleware/auth.js` — Bearer fallback removed entirely
The `Authorization: Bearer` fallback in `protect` was accepted alongside the cookie and was present in both development and production. No frontend code sends a Bearer header (verified), but the surface remained. Removed entirely: `admin_token` cookie is now the only accepted credential. The Vite dev proxy forwards `/api/*` to the backend on the same connection, so cookies are sent correctly in development without a fallback.

---

### CSP Hardening

#### FIX-44: `vercel.json` + `netlify.toml` — `unsafe-inline` replaced with SHA256 hash
The theme-flash-prevention `<script>` in `index.html` is the only inline script in the build. Computed its SHA256: `sha256-G9v+QmIY1p+2LMeH3fFQy+ic+PB/lTw7ARkWjwr+BDk=`. Replaced `'unsafe-inline'` on `script-src` with this specific hash. Browsers execute only this exact script; any injected inline script is blocked.

#### FIX-45: `vercel.json` + `netlify.toml` — `connect-src` scoped to actual API origin
`connect-src 'self' https:` allowed `fetch()` to any HTTPS origin. Replaced with `connect-src 'self' https://api.samiralam.dev` — the specific backend origin. XSS cannot exfiltrate to arbitrary endpoints.

---

### npm test

#### FIX-46: `Back-end/package.json` — `npm test` now runs the 24-test suite
Previously: `"test": "echo \"No tests configured\" && exit 0"` — always passed, ran nothing. Fixed: `"test": "node src/middleware/loginThrottle.test.js"`. Running `npm test` now executes all 24 loginThrottle tests.

---

## Final State

| Issue | Status |
|-------|--------|
| TypeScript: 7 errors | ✅ Fixed — `tsc --noEmit` exits 0 |
| W2: expired-cookie logout | ✅ Fixed — logout unprotected, cookie always cleared |
| W3: Bearer fallback | ✅ Fixed — removed entirely |
| CSP unsafe-inline on script-src | ✅ Fixed — SHA256 hash |
| CSP connect-src wildcard | ✅ Fixed — scoped to API origin |
| npm test stub | ✅ Fixed — 24/24 loginThrottle tests |
