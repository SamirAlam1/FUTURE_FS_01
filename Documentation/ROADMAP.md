# Roadmap & Future Scope

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 1.0 shipped  
**Status:** Planning

All items below are potential future work. None are committed. Items are derived from natural extension points in the v1.0 codebase — no speculative features invented.

---

## 1. Short-term (v1.1 — Low effort, high value)

### 1.1 Connect Frontend to Live API
**Current state:** Frontend reads from static `src/data/portfolio.ts`.  
**Change:** Replace section data imports with `useEffect` + `fetch` calls to the backend API. Add loading skeletons and error boundaries per section.

**Files affected:** All `src/sections/*.tsx`, `src/pages/Projects.tsx`  
**Effort:** Medium — no new backend work required

---

### 1.2 Email Notification on Contact Form
**Current state:** Messages are stored in MongoDB but no notification is sent.  
**Change:** After `Message.create()`, send an email to the admin using a transactional email service (Resend, SendGrid, or Nodemailer + SMTP).

**New backend dependency:** `resend` or `nodemailer`  
**New env var:** `SMTP_API_KEY` (or `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)  
**Effort:** Low

---

### 1.3 Image Upload for Projects
**Current state:** Project images are external URLs only.  
**Change:** Add a file upload endpoint (`POST /api/admin/upload`) that stores images in Cloudinary or an S3-compatible bucket. Return a URL for use in the project form.

**New backend dependencies:** `multer`, `cloudinary` or `@aws-sdk/client-s3`  
**New env vars:** `CLOUDINARY_URL` or `AWS_*` credentials  
**Effort:** Medium

---

### 1.4 Automated Test Suite
**Current state:** No tests configured.  
**Change:** Implement Jest + Supertest for backend (auth, CRUD, middleware), Vitest + React Testing Library for frontend (form validation, filter logic). See `TESTING.md` for the full setup plan.

**Effort:** Medium

---

### 1.5 Resume PDF Upload
**Current state:** `resumeUrl` in `portfolio.ts` points to `#`.  
**Change:** Add a file upload for the resume PDF (Cloudinary or S3), store the URL in a `settings` collection, expose it via `GET /api/settings`.

**Effort:** Low-Medium

---

## 2. Medium-term (v1.2 — Moderate effort)

### 2.1 Testimonials Section
**Current state:** No testimonials in the current schema or UI.  
**Change:** New Mongoose model `Testimonial` (`{ author, role, company, quote, avatarUrl, order }`). New section between Experience and Skills. Admin CRUD page.

---

### 2.2 Password Reset Flow
**Current state:** Lost password requires direct DB access.  
**Change:** Add `POST /api/auth/forgot-password` (generates a signed token, emails a reset link) and `POST /api/auth/reset-password` (verifies token, updates password). Requires email capability from 1.2 above.

---

### 2.3 Dark-Mode Image Treatment
**Current state:** Hero photo filter is applied globally (`grayscale(65%) contrast(1.08)`).  
**Change:** Detect current theme and optionally adjust filter values per mode — slightly warmer in dark mode.

---

### 2.4 Analytics Dashboard
**Current state:** Admin dashboard shows static counts from MongoDB.  
**Change:** Log page view events (anonymous, no PII) to a `pageviews` collection via a lightweight `POST /api/analytics/view` endpoint. Display weekly visitor trend in the dashboard. Alternative: integrate Plausible Analytics or Fathom for zero-backend-work analytics.

---

### 2.5 Admin: Experience and Certifications Management
**Current state:** Backend has full CRUD for `experiences` and `certifications`; admin panel only covers projects, skills, education, and messages.  
**Change:** Add `ExperienceList.tsx` and `CertificationsList.tsx` admin pages, register them in `AdminLayout` nav and `App.tsx` routes.

**Effort:** Low (backend already done; just frontend pages needed)

---

## 3. Long-term (v2.0 — Significant scope change)

### 3.1 Multi-Section CMS (Full Headless)
Replace all static `portfolio.ts` data with database-driven content. Every section (bio text, hero tagline, availability status, social links) editable from the admin panel without code changes.

**New model:** `Settings` collection with key-value pairs for developer profile data.

---

### 3.2 Public API
Expose a documented, versioned public API (`/api/v1/*`) so that the portfolio content can be consumed by other tools (mobile app, CLI, integrations).

---

### 3.3 Webhooks
Emit webhook events on admin actions (project created, message received) to integrate with external tools (Slack, Zapier, Make).

---

## 4. Not Planned

The following are explicitly out of scope and will not be implemented:

| Feature | Reason |
|---------|--------|
| Blog / article publishing | Out of scope (per requirements) |
| Multi-user admin | Single-admin design; not needed |
| OAuth login (GitHub, Google) | Adds complexity without benefit for single admin |
| Comments system | Not a portfolio requirement |
| E-commerce / payments | Not applicable |
| Internationalisation (i18n) | Not applicable for personal portfolio |
