# Samir Alam — Developer Portfolio & CMS

A full-stack personal portfolio with a headless admin CMS, hardened against OWASP Top 10 vulnerabilities relevant to a single-admin SPA+API architecture.

**Live:** https://samiralam.dev  
**Stack:** React 19 + TypeScript + Tailwind CSS v4 · Express 5 + Node.js · MongoDB Atlas

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Backend

```bash
cd Back-end
cp .env.example .env          # Fill in values (see below)
npm install
node src/seed.js              # Create admin account (run once)
node src/server.js            # Start server on port 5000
```

**Required `.env` values:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=<at-least-32-random-characters>
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=YourStrongPass1
```

### Frontend

```bash
cd Front-end
cp .env.example .env          # Set VITE_API_URL if needed
npm install
npm run dev                   # Starts on http://localhost:5173
```

The Vite dev proxy forwards `/api/*` → `http://localhost:5000/api/*`, so no CORS issues in development.

---

## Architecture

```
Front-end (Vercel)          Back-end (Render)           Database (Atlas)
─────────────────           ─────────────────           ────────────────
React SPA                   Express 5 API               MongoDB
src/lib/api.ts              src/server.js               7 collections
  credentials:include  →    cookie-parser
  (httpOnly cookie)         src/middleware/
                              auth.js (cookie protect)
                              loginThrottle.js
                              sanitize.js
                            src/controllers/
                            src/models/
```

**Authentication:** httpOnly cookie (`admin_token`). The JWT is never exposed to JavaScript. Token is set on login, cleared on logout, and invalidated immediately on password change via `passwordChangedAt` comparison.

---

## Security Highlights

| Layer | Implementation |
|-------|----------------|
| httpOnly cookie auth | Token inaccessible to JS — eliminates XSS token theft |
| Two-layer login throttle | IP limiter (10/15min) + per-account progressive delay (500ms→15s) + 15-min lockout |
| JWT algorithm pinning | `algorithms: ['HS256']` blocks `alg:none` and algorithm confusion |
| Token invalidation | `passwordChangedAt` check in `protect` middleware — all prior sessions invalidated on password change |
| Mass assignment protection | `pick()` in all write controllers |
| NoSQL injection prevention | Custom `sanitize.js` (body) + enum allowlists (query params) |
| Stored XSS prevention | HTML stripped from contact messages before DB write |
| URL injection prevention | `http(s)://` validators on all URL fields |
| Security headers | Helmet (CSP, HSTS, X-Frame-Options) + Vercel/Netlify header config |

---

## Project Structure

```
portfolio-improved/
├── Back-end/
│   ├── src/
│   │   ├── config/         db.js, jwt.js
│   │   ├── controllers/    authController.js, crudController.js,
│   │   │                   messagesController.js, projectsController.js
│   │   ├── middleware/     auth.js, errorHandler.js,
│   │   │                   loginThrottle.js, loginThrottle.test.js, sanitize.js
│   │   ├── models/         Admin.js, Project.js, index.js
│   │   ├── routes/         index.js
│   │   ├── seed.js
│   │   └── server.js
│   └── package.json
│
├── Front-end/
│   ├── src/
│   │   ├── lib/            api.ts (centralised fetch with credentials:include)
│   │   ├── components/     Navbar.tsx, Footer.tsx
│   │   ├── contexts/       ThemeContext.tsx
│   │   ├── data/           portfolio.ts
│   │   ├── hooks/          useScrollSpy.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx, Projects.tsx
│   │   │   └── admin/      AdminLogin.tsx, AdminLayout.tsx, Dashboard.tsx,
│   │   │                   ProjectsList.tsx, SkillsList.tsx, EducationList.tsx,
│   │   │                   ExperienceList.tsx, CertificationList.tsx, Messages.tsx
│   │   └── sections/       Hero, About, Experience, Education,
│   │                       Skills, Certifications, ProjectsPreview, Contact
│   ├── public/             robots.txt (blocks /admin), favicon.svg
│   ├── vercel.json         SPA routing + security headers
│   ├── netlify.toml        SPA routing + security headers
│   └── package.json
│
└── Documentation/
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DATABASE_DESIGN.md
    ├── DEPLOYMENT.md
    ├── DEPLOYMENT_ARCHITECTURE.md
    ├── FIXES.md
    ├── PRD.md
    ├── ROADMAP.md
    ├── SECURITY_THREAT_MODEL.md
    ├── SRS.md
    ├── TESTING.md
    └── UI_UX_SPECIFICATION.md
```

---

## Running Tests

```bash
cd Back-end
node src/middleware/loginThrottle.test.js   # 24/24 tests
```

---

## Deployment

See `Documentation/DEPLOYMENT.md` for full instructions.

**Vercel (frontend):** Set `VITE_API_URL=https://api.samiralam.dev/api`  
**Render (backend):** Set all env vars listed above; run seed script once  
**CORS:** `FRONTEND_URL` must exactly match the deployed frontend origin — required for cross-origin cookie transmission

---

## Documentation

| File | Contents |
|------|---------|
| `API.md` | All endpoints, request/response shapes, rate limits |
| `ARCHITECTURE.md` | System design, auth flow, security layers |
| `DATABASE_DESIGN.md` | All collection schemas with constraints |
| `DEPLOYMENT.md` | Step-by-step deployment guide |
| `DEPLOYMENT_ARCHITECTURE.md` | Production topology, request flows, scaling |
| `SECURITY_THREAT_MODEL.md` | STRIDE analysis, all controls, known limitations |
| `SRS.md` | Formal requirements specification |
| `TESTING.md` | Test plan, manual cases, automated test docs |
| `FIXES.md` | Cumulative log of all bugs and security fixes |
| `ROADMAP.md` | Planned future work |
| `UI_UX_SPECIFICATION.md` | Design system, tokens, components, motion |
