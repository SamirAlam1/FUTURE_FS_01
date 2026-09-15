# Architecture

## Overview

```
Browser
  │
  ├── Frontend (React SPA)
  │     Vite · TypeScript · Tailwind CSS v4
  │     Served as static files (Vercel / Netlify / CDN)
  │
  └── Backend (REST API)
        Express 5 · Node.js ≥ 18
        httpOnly-cookie auth · Two-layer rate limiting · Helmet
        │
        └── MongoDB (Atlas or self-hosted)
```

---

## Frontend Architecture

```
src/
├── lib/
│   └── api.ts            Centralised fetch wrapper (credentials:include on every request)
├── components/           Reusable layout components (Navbar, Footer)
├── contexts/             ThemeContext (dark/light mode)
├── data/                 Static portfolio data (portfolio.ts)
├── hooks/                useScrollSpy
├── pages/
│   ├── Home.tsx          Single-page portfolio (all sections)
│   ├── Projects.tsx      Full projects grid with search/filter
│   └── admin/            Admin panel (protected routes)
│       ├── AdminLogin.tsx
│       ├── AdminLayout.tsx
│       ├── Dashboard.tsx
│       ├── ProjectsList.tsx
│       ├── SkillsList.tsx
│       ├── EducationList.tsx
│       ├── ExperienceList.tsx
│       ├── CertificationList.tsx
│       └── Messages.tsx
└── sections/             Home page sections (Hero, About, etc.)
```

### Authentication (Frontend)

Authentication uses **httpOnly cookies**, not `localStorage`. The flow:

1. `POST /api/auth/login` with `credentials: 'include'` — server sets `admin_token` cookie
2. All subsequent requests use `apiFetch()` from `src/lib/api.ts`, which always sends `credentials: 'include'`
3. `AdminLayout` verifies the session on every mount via `GET /api/auth/me`
4. Logout calls `POST /api/auth/logout` — server clears the cookie server-side
5. On any 401 inside `/admin/*`, `apiFetch` redirects to `/admin/login` automatically

The token is **never readable by JavaScript** (`httpOnly` cookie attribute). This eliminates the XSS token-theft vector.

### State Management
No global state library. State is local to components. Theme is managed via React Context.

### Routing
React Router v6. Three route groups:
1. Public (`/`, `/projects`)
2. Admin auth (`/admin/login`)
3. Admin protected (`/admin/*`) — `AdminLayout` verifies session before rendering

---

## Backend Architecture

```
src/
├── config/         db.js (Mongoose connection), jwt.js (sign/verify, HS256, min 32-char secret)
├── controllers/    Route handlers — one per resource + generic crudController
├── middleware/     auth.js (cookie-based protect), errorHandler.js,
│                   loginThrottle.js (account-level brute-force), sanitize.js
├── models/         Mongoose schemas (Admin, Project, Skill, Education, etc.)
├── routes/         index.js — all routes in one file, grouped by access level
├── seed.js         One-time admin creation script (enforces password complexity)
└── server.js       Express app entry point
```

### Security Layers (in middleware chain order)

1. **Helmet** — security headers (HSTS, CSP, X-Frame-Options, noSniff, etc.)
2. **CORS** — allowlist-based with `credentials: true`; no wildcard in production
3. **trust proxy: 1** — accurate IP for rate limiting behind Render load balancer
4. **Global rate limit** — 300 req / 15 min per IP (all routes)
5. **IP login rate limit** — 10 failures / 15 min per IP (login endpoint)
6. **Account login throttle** — per-email progressive backoff (500 ms → 15 s) + 15-min hard lockout after 10 consecutive failures (login endpoint)
7. **Contact rate limit** — 5 req / hour per IP
8. **Body parser** — `express.json({ limit: '10kb' })`
9. **Cookie parser** — parses `admin_token` httpOnly cookie
10. **MongoDB body sanitiser** — strips `$`/`.` from req.body (custom, Express 5 compatible)
11. **JWT auth** — `protect` middleware: reads cookie → verifies HS256 signature → checks `passwordChangedAt` → attaches `req.admin`
12. **bcrypt** — password hashing at cost 12
13. **Field whitelisting** — `pick()` in all write controllers prevents mass assignment

### Token Invalidation
- JWT default expiry: **1 day**
- Password change bumps `passwordChangedAt` on the `Admin` document (pre-save hook)
- `protect` middleware rejects tokens with `iat < passwordChangedAt` — all pre-change sessions immediately invalidated
- Password change issues a fresh cookie for the current session

### Error Handling
Centralised `errorHandler` catches all errors. In production: no stack traces, generic 5xx message. Handles Mongoose validation, CastError, duplicate key, JWT errors, CORS errors.

---

## Design System

See `UI_UX_SPECIFICATION.md` for full detail.

All design values are CSS custom properties on `:root` / `.dark`. Fluid `clamp()`-based type scale. Spring and ease-out easing curves. All animations disabled under `prefers-reduced-motion`.

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| httpOnly cookie auth (not localStorage) | Eliminates XSS token-theft risk; token never accessible to JS |
| SameSite=None + Secure in production | Required for cross-origin (Vercel→Render) cookie transmission |
| SameSite=Lax in development | Works over plain HTTP on localhost without needing HTTPS |
| Two-layer login throttle (IP + account) | IP layer blocks single-IP attacks cheaply; account layer blocks distributed attacks on one email |
| In-memory account throttle store | Zero dependencies; single Render instance; TTL cleanup prevents memory growth |
| `passwordChangedAt` on Admin model | Allows immediate invalidation of all sessions on password change without a token blacklist |
| Per-model field whitelists in controllers | Prevents mass assignment even if schema evolves to include sensitive fields |
| Custom sanitize.js (not express-mongo-sanitize) | express-mongo-sanitize crashes on Express 5 (read-only req.query getter) |
| No global state library | State is local to each component; no cross-component sharing needed |
| Static `portfolio.ts` for public data | Avoids loading spinners on public site; content via admin panel persists to DB |
| Single `routes/index.js` | All routes visible in one place; easy to audit access control |
| Generic `crudController` factory | Eliminates duplication across 4 models with identical CRUD behaviour |
| `order` field on all content models | Manual display ordering without touching dates |
