# Deployment Architecture

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 2.0  
**Status:** Reference architecture for production deployment

---

## 1. Production Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        DNS (Namecheap / GoDaddy)                 │
│   samiralam.dev      →  Vercel CDN                               │
│   api.samiralam.dev  →  Render Load Balancer                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
             ┌─────────────┴──────────────┐
             │                            │
             ▼                            ▼
  ┌─────────────────────┐    ┌────────────────────────┐
  │   Vercel (Edge CDN)  │    │   Render (Web Service) │
  │                     │    │                        │
  │  Static SPA Assets  │    │  Node.js Express API   │
  │  dist/index.html    │    │  PORT 5000             │
  │  dist/assets/*.js   │    │  NODE_ENV=production   │
  │  dist/assets/*.css  │    │                        │
  │                     │    │  Auto-restart on crash │
  │  TLS: Vercel auto   │    │  TLS: Render auto      │
  │  CDN: 100+ PoPs     │    │  Region: Ohio (us-east)│
  └──────────┬──────────┘    └────────────┬───────────┘
             │                            │
             │  HTTPS + httpOnly cookie   │  Mongoose TCP/TLS
             │  credentials:include       │  MONGODB_URI
             │                            ▼
             │               ┌────────────────────────┐
             └──────────────►│   MongoDB Atlas (M0)    │
                             │                        │
                             │  Cluster: AWS us-east-1│
                             │  DB: portfolio          │
                             │  Collections: 7         │
                             │                        │
                             │  IP allowlist:          │
                             │  Render server IP only  │
                             └────────────────────────┘
```

**Cross-origin cookie note:** Frontend (Vercel, `samiralam.dev`) and backend (Render,
`api.samiralam.dev`) are on different origins. The `admin_token` cookie is issued with
`SameSite=None; Secure` so the browser sends it on cross-origin credentialed requests.
All admin API calls use `credentials: 'include'`.

---

## 2. Component Responsibilities

### 2.1 Vercel (Frontend)

| Property | Value |
|----------|-------|
| Type | Static file CDN |
| Build trigger | Git push to `main` |
| Build command | `npm run build` |
| Output | `dist/` |
| Routing | SPA rewrite: all paths → `index.html` (via `vercel.json`) |
| Security headers | `vercel.json` sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| TLS | Automatic (Let's Encrypt) |
| Environment variables | `VITE_API_URL` |
| Cold start | None (static assets only) |

---

### 2.2 Render (Backend)

| Property | Value |
|----------|-------|
| Type | Web Service (Node.js) |
| Start command | `node src/server.js` |
| Health check | `GET /health` → `{ "status": "ok", "timestamp": "..." }` |
| Auto-deploy | Git push to `main` |
| Scaling | Single instance (free tier) |
| Environment variables | `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` |
| TLS | Automatic (Let's Encrypt) |
| Cold start | ~30 s on free tier (instance sleeps after 15 min inactivity) |
| trust proxy | `1` — matches single Render LB hop |

**Cold start mitigation:** On paid tier, disable sleep. On free tier, the first admin login after inactivity may experience a 30-second delay.

---

### 2.3 MongoDB Atlas (Database)

| Property | Value |
|----------|-------|
| Tier | M0 (free) or M10+ (paid) |
| Cloud provider | AWS |
| Region | us-east-1 (same region as Render for lowest latency) |
| Authentication | Username + password database user |
| IP allowlist | Render server IP(s) only |
| Backups | Continuous (M10+); manual snapshots only on M0 |
| Connection pool | `maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000` |
| Database name | `portfolio` |

---

## 3. Environment Variables Map

### Frontend (Vercel Dashboard)

```
VITE_API_URL=https://api.samiralam.dev/api
```

### Backend (Render Dashboard)

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=<64+ random bytes from: openssl rand -base64 64>
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://samiralam.dev
```

No environment variables are committed to source control. `.env` files are in `.gitignore`.

---

## 4. Request Flow: Public Portfolio Page Load

```
1. User navigates to https://samiralam.dev
2. DNS resolves to Vercel CDN edge node (nearest PoP)
3. Vercel serves dist/index.html (cache hit: ~10ms)
4. Browser fetches dist/assets/index-*.js, index-*.css (cached)
5. React boots, renders from static portfolio.ts data
6. No API calls on initial page load (data is static)
7. User fills contact form → POST https://api.samiralam.dev/api/contact
   (credentials:'include' — no cookie sent; cookie only exists for admin sessions)
8. Render: contactLimiter → messagesController → Message.create()
9. MongoDB Atlas stores message → 201 response
10. Frontend shows success state
```

---

## 5. Request Flow: Admin Login and Content Update

```
1. Admin navigates to https://samiralam.dev/admin/login
2. Vercel serves index.html → React renders AdminLogin
3. AdminLogin mounts → probes GET /auth/me with credentials:'include'
   → 401 (no cookie) → stays on login page, shows form
4. Admin submits credentials → POST https://api.samiralam.dev/api/auth/login
   with credentials:'include'
5. Render middleware chain:
   ipLoginLimiter → loginThrottle (checks per-email failure count)
   → Admin.findOne() → bcrypt.compare() (constant-time, even for unknown emails)
6. On success:
   → jwt.sign({ id, email }) → setAuthCookie() → Set-Cookie: admin_token=...; HttpOnly; Secure; SameSite=None
   → 200 { success: true, admin: { id, email } }   ← NO token in body
7. Browser stores cookie (httpOnly — JS cannot read it)
8. navigate('/admin/dashboard')
9. AdminLayout mounts → GET /auth/me with credentials:'include'
   → cookie sent automatically → 200 → setAuthChecked(true)
10. Admin creates project → POST /api/admin/projects with credentials:'include'
11. Render: protect middleware
    → reads admin_token cookie → jwt.verify() with algorithms:['HS256']
    → checks decoded.iat < admin.passwordChangedAt (M-4 protection)
    → req.admin = decoded → projectsController.createProject()
    → pick() strips non-whitelisted fields → Project.create()
    → 201 { success: true, data: {...} }
12. Admin panel updates project list in local state
```

---

## 6. Request Flow: Admin Logout

```
1. Admin clicks "Sign out"
2. AdminLayout.handleLogout() → POST /api/auth/logout with credentials:'include'
3. Render: protect middleware verifies cookie → logout controller
   → clearAuthCookie(res): Set-Cookie: admin_token=; Max-Age=0; HttpOnly; Secure; SameSite=None
4. Browser removes cookie (httpOnly — only server can clear it)
5. navigate('/admin/login', { replace: true })
6. AdminLogin probes /auth/me → 401 (cookie gone) → shows login form
```

---

## 7. Login Throttle Flow (Distributed Attack Scenario)

```
Attacker rotates IPs, trying one password per IP:

IP-1: POST /auth/login (email: admin@x.com, password: guess1)
  → ipLoginLimiter: 0/10 for IP-1 → passes
  → loginThrottle: account fails=0, no delay → passes
  → bcrypt.compare: false → 401
  → res.on('finish'): account fails++ (now 1)

IP-2: POST /auth/login (same email, password: guess2)
  → ipLoginLimiter: 0/10 for IP-2 → passes
  → loginThrottle: account fails=1, below DELAY_AFTER=3 → passes
  → 401 → account fails=2

... [3rd attempt: no delay] ...

IP-4: POST /auth/login (same email, password: guess4)
  → loginThrottle: account fails=3 ≥ DELAY_AFTER → sleep(~500ms ± jitter)
  → handler runs → 401 → account fails=4

IP-5: sleep(~1s ± jitter), account fails=5
IP-6: sleep(~2s ± jitter), account fails=6
...
IP-10: sleep(~15s ± jitter), account fails=9
  → after this 401: account fails=10 ≥ MAX_FAILURES → lockedUntil = now + 15min

IP-11+: POST /auth/login
  → loginThrottle: lockedUntil in future → sleep(~200ms jitter) → 429 + Retry-After header
  → bcrypt never runs (CPU cost eliminated)
  → next() never called (handler never runs)
```

---

## 8. CI/CD Pipeline

```
Developer machine
    │
    └─ git push origin main
         │
         ├─► Vercel
         │     └─ Detects push → runs npm run build
         │          ├─ Build succeeds → deploys dist/ to CDN (2-3 min)
         │          └─ Build fails → blocked; previous version stays live
         │
         └─► Render
               └─ Detects push → npm install → node src/server.js
                    ├─ Server starts → /health passes → traffic switched (2-4 min)
                    └─ Server fails → blocked; previous version stays live
```

Zero-downtime deploys: Render keeps the previous instance running until the new one passes its health check.

---

## 9. Scaling Considerations

| Bottleneck | Current | Scaled solution |
|-----------|---------|-----------------|
| Frontend | Vercel CDN (already global) | No change needed |
| Backend | Single Render instance | Horizontal scale on Render paid tier |
| Database | MongoDB Atlas M0 (512MB, shared) | Upgrade to M10 (dedicated, 2GB, backups) |
| IP rate limits | In-process `express-rate-limit` | Move to Redis-backed store for consistency across instances |
| Account throttle | In-memory `Map` (per-process) | Replace `loginThrottle._store` Map with Redis for cross-instance consistency |
| Token invalidation | `passwordChangedAt` DB check | Already DB-backed; works across instances |
