# Software Requirements Specification (SRS)

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 2.0  
**Standard:** Based on IEEE 830  
**Status:** As-built (reflects current hardened codebase)

---

## 1. Introduction

### 1.1 Purpose
This SRS describes the software behaviour of the Portfolio CMS system — both the React
frontend SPA and the Node.js/Express/MongoDB backend API. It is an as-built specification
derived from the production codebase.

### 1.2 Scope
The system consists of:
- A React 19 + TypeScript SPA (Vite, Tailwind CSS v4)
- A Node.js + Express 5 REST API
- A MongoDB database (Mongoose ODM)
- httpOnly-cookie-based authentication for the admin panel

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| SPA | Single Page Application |
| httpOnly cookie | Browser cookie inaccessible to JavaScript; set and cleared server-side only |
| JWT | JSON Web Token — stateless auth credential stored in an httpOnly cookie |
| CRUD | Create, Read, Update, Delete |
| CMS | Content Management System |
| ODM | Object-Document Mapper (Mongoose) |
| Protected route | A route that requires a valid `admin_token` cookie |
| Public route | A route accessible without authentication |
| Admin | The single authorised user who manages portfolio content |
| Account throttle | Per-email progressive delay + lockout enforced by `loginThrottle.js` |

### 1.4 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19 |
| Frontend language | TypeScript | 5.x |
| Frontend build tool | Vite | 8.x |
| CSS framework | Tailwind CSS | v4 |
| Routing (frontend) | React Router | 6.x |
| Backend runtime | Node.js | ≥ 18 |
| Backend framework | Express | 5.x |
| Database | MongoDB | (Atlas or self-hosted) |
| ODM | Mongoose | 8.x |
| Auth | JWT (jsonwebtoken) | 9.x |
| Password hashing | bcryptjs | 2.x |
| Cookie parsing | cookie-parser | 1.x |

---

## 2. Overall Description

### 2.1 System Context

```
┌──────────────────────────────────────────┐
│              Browser (Client)             │
│                                          │
│  ┌─────────────┐    ┌──────────────────┐ │
│  │ Public SPA  │    │  Admin Panel SPA │ │
│  │ (React)     │    │  (React)         │ │
│  └──────┬──────┘    └────────┬─────────┘ │
│         │ HTTPS              │ HTTPS +   │
│         │ credentials:include│ httpOnly  │
│         │                   │ cookie    │
└─────────┼───────────────────┼───────────┘
          │                   │
          ▼                   ▼
┌─────────────────────────────────────────┐
│         Express REST API                │
│         /api/*                          │
│                                         │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ Public   │  │ Protected            │ │
│  │ Routes   │  │ Routes (/admin/*)    │ │
│  └────┬─────┘  └──────────┬───────────┘ │
│       │                   │             │
└───────┼───────────────────┼─────────────┘
        │                   │
        ▼                   ▼
┌───────────────────────────────────────┐
│              MongoDB                   │
│  Collections: admins, projects,        │
│  skills, educations, experiences,      │
│  certifications, messages              │
└───────────────────────────────────────┘
```

### 2.2 Assumptions and Constraints
- Single admin user (no multi-tenancy)
- Images are external URLs (no file upload in v1.0)
- Node.js ≥ 18 required
- MongoDB must be reachable at `MONGODB_URI` before server starts
- Frontend and backend are on different origins in production (Vercel / Render)

---

## 3. System Features and Requirements

### 3.1 Frontend — Public Portfolio

#### FR-P-01 through FR-P-07
_(Unchanged — see UI/UX Specification for detail)_

The contact form submits to `${VITE_API_URL}/contact` via `apiFetch()` with
`credentials: 'include'`. Rate limited at 5 requests / hour per IP server-side.

---

### 3.2 Frontend — Admin Panel

#### FR-A-01: Authentication Gate
- On mount, `AdminLayout` calls `GET /api/auth/me` with `credentials: 'include'`
- The browser automatically sends the `admin_token` httpOnly cookie
- If response is non-200, navigate to `/admin/login`
- Network failure allows through (offline tolerance); next API call will 401 if truly invalid
- All admin API requests use `apiFetch()` from `src/lib/api.ts` which always sends
  `credentials: 'include'`; no `Authorization` header is used

#### FR-A-02: Login
- `AdminLogin` mounts → probes `GET /auth/me`; if 200 (existing session) → redirect to dashboard
- On form submit: `POST ${VITE_API_URL}/auth/login` via `apiFetch()` with `credentials: 'include'`
- On success: server sets `admin_token` httpOnly cookie; response body contains only
  `{ success, admin: { id, email } }` — **no token in body**; navigate to `/admin/dashboard`
- On failure: display `data.message` in error banner
- Client-side lockout after 5 consecutive failures: 5-minute UI lockout with countdown timer
  (Note: server-side account lockout at 10 failures is the real enforcement layer)

#### FR-A-03: Logout
- Sidebar "Sign out" → `POST /api/auth/logout` with `credentials: 'include'`
- Server sets `Set-Cookie: admin_token=; Max-Age=0` — cookie cleared
- navigate to `/admin/login`

#### FR-A-04: CRUD Pages
- `ProjectsList`, `SkillsList`, `EducationList`, `ExperienceList`, `CertificationList`:
  list, create, edit, delete via modal form
- `Messages`: list (paginated), mark as read, delete
- All delete actions require confirmation

#### FR-A-05: Dashboard
- Displays: total projects, featured, skills, education, messages total/unread
- Lists 3 most recent messages, 3 featured projects
- Quick-action links to each admin section

---

### 3.3 Backend API

#### FR-B-01: Server Startup
- `connectDB()` completes before `app.listen()`
- If `MONGODB_URI` undefined → throw → `process.exit(1)`
- If `JWT_SECRET` < 32 chars → throw on first JWT operation
- `GET /health` responds `{ status: 'ok', timestamp }` without authentication

#### FR-B-02: Authentication

| Behaviour | Specification |
|-----------|--------------|
| Login | `POST /api/auth/login`: validates email/password → bcrypt compare (constant-time) → `jwt.sign()` → `Set-Cookie: admin_token` httpOnly |
| Token not in body | Login response: `{ success, admin }` only. Token is never in the JSON body. |
| Logout | `POST /api/auth/logout` (protected): `Set-Cookie: admin_token=; Max-Age=0` |
| Cookie | `httpOnly; Secure; SameSite=None; maxAge=86400000 (1 day)` in production |
| Cookie (dev) | `httpOnly; SameSite=Lax` (no Secure for HTTP localhost) |
| Protected routes | `admin_token` cookie required; `jwt.verify()` with `algorithms: ['HS256']` |
| Algorithm pinning | Both `jwt.js` and `auth.js` explicitly pass `{ algorithms: ['HS256'] }` |
| Token invalidation | `protect` rejects tokens where `decoded.iat < admin.passwordChangedAt` |
| Password change | Bumps `passwordChangedAt`; issues fresh cookie for current session |
| Change-password rules | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit; must differ from current |
| bcrypt DoS protection | Password capped at 128 chars before compare |

#### FR-B-03: Data Validation

| Model | Required fields | Notable constraints |
|-------|----------------|---------------------|
| Admin | email, password | email unique; password min 8 + complexity; `passwordChangedAt` managed by pre-save hook |
| Project | title, description, category, year | category enum; year 4-digit; liveUrl/githubUrl/image must be `http(s)://` |
| Skill | name, category | category enum; proficiency 0–100 |
| Education | institution, degree, field, startYear, endYear | startYear/endYear must be 4-digit |
| Experience | company, role, startDate, endDate | — |
| Certification | title, issuer, date | credentialUrl must be `http(s)://` if provided |
| Message | name, email, subject, message | email format; message 10–5000 chars; HTML stripped before save |

#### FR-B-04: Mass Assignment Prevention
All write controllers (`create`, `update`) use a `pick()` function that only passes
explicitly whitelisted fields to Mongoose. Fields like `_id`, `__v`, `createdAt`, and any
future internal fields are dropped even if present in the request body.

#### FR-B-05: Error Responses
All errors follow: `{ success: false, message: string }`

| Condition | Status |
|-----------|--------|
| Mongoose ValidationError | 400 |
| Mongoose CastError (bad ObjectId) | 400 (path only, no raw value) |
| Missing required fields | 400 |
| Invalid/expired JWT or cookie | 401 |
| No session / cookie | 401 |
| Token issued before password change | 401 |
| CORS rejection | 403 |
| Resource not found | 404 |
| MongoDB duplicate key | 409 |
| Rate limit exceeded | 429 |
| Account locked (throttle) | 429 + `Retry-After` header |
| Unhandled error | 500 (generic message in production) |

#### FR-B-06: Rate Limiting

| Limiter | Window | Max | Applied to | Notes |
|---------|--------|-----|------------|-------|
| Global | 15 min | 300 req | All routes | Per IP |
| IP login | 15 min | 10 failures | `POST /auth/login` | `skipSuccessfulRequests:true` |
| Account login | Per email | 10 failures | `POST /auth/login` | Progressive delay 500ms→15s; 15-min lockout; TTL cleanup |
| Contact | 60 min | 5 req | `POST /contact` | Per IP |

---

### 3.4 Security Requirements

#### FR-S-01: Transport
- Production: HTTPS only (Vercel/Render); Helmet sets `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

#### FR-S-02: CORS
- Allowed origins from `FRONTEND_URL` (comma-separated); never wildcard
- `credentials: true` required for cross-origin cookie support
- Requests without `Origin` header blocked in production

#### FR-S-03: Input Sanitisation
- Custom `sanitize.js`: strips `$`/`.` keys from `req.body`
- `req.query` validated via enum allowlist in controllers (Express 5 incompatibility with `express-mongo-sanitize`)
- `express.json({ limit: '10kb' })`

#### FR-S-04: Secrets
- `JWT_SECRET` from environment variables only; min 32 chars enforced
- Admin credentials never logged or in API responses
- `Admin.toJSON()` deletes `password` and `passwordChangedAt`
- No secrets in compiled frontend bundle (`VITE_*` prefix only exposes `VITE_API_URL`)

---

## 4. External Interface Requirements

### 4.1 Frontend Environment Variables

| Variable | Type | Required | Default |
|----------|------|----------|---------|
| `VITE_API_URL` | string (URL) | Yes | `/api` |

### 4.2 Backend Environment Variables

| Variable | Type | Required | Default |
|----------|------|----------|---------|
| `PORT` | number | No | `5000` |
| `NODE_ENV` | string | Yes | — |
| `MONGODB_URI` | string | Yes | — |
| `JWT_SECRET` | string (≥ 32 chars) | Yes | — |
| `JWT_EXPIRES_IN` | string | No | `1d` |
| `FRONTEND_URL` | string (URL or comma-separated) | Yes | `http://localhost:5173` |

### 4.3 Browser Support
- Modern evergreen browsers (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)
- `SameSite=None` cookie requires HTTPS in production (all listed browsers support this)
- Minimum viewport: 320px

---

## 5. Data Flow

### 5.1 Contact Form Submission
```
User fills form → client validation → apiFetch POST /api/contact (credentials:include)
  → contactLimiter → stripHtml() → Message.create() → 201
  → Frontend shows success state
```

### 5.2 Admin Login
```
Admin enters credentials → apiFetch POST /api/auth/login (credentials:include)
  → ipLoginLimiter → loginThrottle (delay / lockout check)
  → Admin.findOne() → bcrypt.compare() (constant-time)
  → jwt.sign() → setAuthCookie() [Set-Cookie: admin_token; HttpOnly; Secure; SameSite=None]
  → 200 { success, admin } ← no token in body
  → navigate('/admin/dashboard')
```

### 5.3 Protected CRUD Request
```
Admin action → apiFetch with credentials:include (browser sends admin_token cookie)
  → protect middleware → jwt.verify(token, secret, { algorithms: ['HS256'] })
  → Admin.findById().select('+passwordChangedAt') → iat check
  → pick(allowedFields, req.body) → Mongoose operation → 200/201/404
  → Frontend updates UI
```

### 5.4 Password Change
```
Admin submits change-password form → apiFetch POST /auth/change-password (credentials:include)
  → protect → authController.changePassword()
  → admin.password = newPassword → admin.save()
  → pre-save hook: hash password, set passwordChangedAt = Date.now() - 1000
  → jwt.sign() → setAuthCookie() [fresh cookie, new iat > passwordChangedAt]
  → 200 { success, message }
  → All prior tokens (from any other session) now fail the iat < passwordChangedAt check
```
