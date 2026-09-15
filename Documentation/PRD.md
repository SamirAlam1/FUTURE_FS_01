# Product Requirements Document (PRD)

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 2.0  
**Last updated:** September 2026  
**Author:** Samir Alam  
**Status:** Shipped (hardened)

---

## 1. Purpose

Personal developer portfolio with a headless admin CMS. Fully hardened against OWASP Top 10 attack vectors relevant to a single-admin SPA+API architecture.

---

## 2. Problem Statement

A developer needs a public-facing portfolio that represents their skills and projects accurately, can be updated without touching source code, and is secure enough for production without requiring a dedicated security team.

---

## 3. Users

| Persona | Goal |
|---------|------|
| **Portfolio Owner** (Samir) | Present work professionally; manage content securely without code changes |
| **Potential Employer / Recruiter** | Quickly assess skills, experience, and project quality |
| **Potential Collaborator** | Understand technical background and make contact |

---

## 4. Pages and Sections

### 4.1 Public Portfolio (`/`)

| Section | Content |
|---------|---------|
| Hero | Name, typewriter tagline, availability, CTAs, social links, MERN badges |
| About | Bio, engineering principles, snapshot panel |
| Experience | Timeline of professional roles |
| Education | Academic history timeline |
| Skills | Categorised skill pills |
| Certifications | Credentials with issuer, date, credential URL |
| Projects | 4 featured projects grid |
| Contact | Floating-label form + info |

### 4.2 Projects Page (`/projects`)
Full searchable, filterable, sortable grid.

### 4.3 Admin Panel (`/admin/*`)

| Route | Purpose |
|-------|---------|
| `/admin/login` | Email + password sign-in (httpOnly cookie auth) |
| `/admin/dashboard` | Stats overview, recent messages, quick actions |
| `/admin/projects` | CRUD for projects |
| `/admin/skills` | CRUD for skills |
| `/admin/education` | CRUD for education entries |
| `/admin/experience` | CRUD for experience entries |
| `/admin/certifications` | CRUD for certifications |
| `/admin/messages` | View, mark-read, delete contact messages |

---

## 5. Functional Requirements

### 5.1 Public Portfolio

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | All portfolio sections on a single scrollable page | Must |
| FR-02 | Navigation highlights active section as user scrolls | Must |
| FR-03 | Smooth scroll to section on nav click | Must |
| FR-04 | Dark/light mode toggle, persistent | Must |
| FR-05 | Contact form validates and submits to backend API | Must |
| FR-06 | Contact form shows success/error feedback | Must |
| FR-07 | Sections animate in on scroll | Should |
| FR-08 | Typewriter effect in hero | Should |
| FR-09 | Fully responsive 320px–1440px | Must |
| FR-10 | Accessible: semantic HTML, aria labels, focus-visible | Must |

### 5.2 Projects Page

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Filterable, searchable project grid | Must |
| FR-12 | Filter by category | Must |
| FR-13 | Search by title, description, tech stack | Must |
| FR-14 | Sort by year | Should |
| FR-15 | Empty state with clear-filter action | Must |

### 5.3 Admin Panel

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Admin authenticates with email + password | Must |
| FR-17 | Auth token stored in httpOnly cookie; never in localStorage or response body | Must |
| FR-18 | Unauthenticated `/admin/*` access redirects to login | Must |
| FR-19–22 | CRUD for projects, skills, education, experience, certifications, messages | Must |
| FR-23 | Dashboard stats and recent items | Should |
| FR-24 | Admin can change password (invalidates all prior sessions) | Should |
| FR-25 | Server-side logout clears cookie | Must |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Performance — Lighthouse score | ≥ 90 |
| NFR-02 | Accessibility — WCAG 2.1 AA | Must |
| NFR-03 | SEO — meta tags, OG, canonical, robots.txt | Must |
| NFR-04 | Security — no secrets in frontend bundle; all admin routes protected; httpOnly cookie auth | Must |
| NFR-05 | Rate limiting — global 300/15min; IP login 10/15min; account login progressive + lockout; contact 5/hr | Must |
| NFR-06 | Input safety — MongoDB sanitisation, HTML stripping, URL validation, mass assignment protection | Must |
| NFR-07 | Responsiveness — functional at 320px, 768px, 1280px, 1440px | Must |
| NFR-08 | Build size — JS bundle ≤ 400 kB gzip | Should |
| NFR-09 | CORS — allowlist-based; no wildcard; credentials support for cross-origin cookies | Must |
| NFR-10 | Password storage — bcrypt cost 12; complexity enforced at seed and change-password | Must |

---

## 7. Out of Scope (v1.0)

- Blog or article publishing
- Multi-user admin
- Analytics dashboard
- Email notifications on contact form
- OAuth / SSO login
- File/image upload (images by URL)
- Public API
- Internationalisation

---

## 8. Success Criteria

| Metric | Status |
|--------|--------|
| Build passes with zero TypeScript errors | ✓ |
| Production build succeeds | ✓ |
| All admin CRUD routes protected by cookie auth | ✓ |
| No secrets in compiled frontend bundle | ✓ |
| No JWT/token in localStorage or response body | ✓ |
| httpOnly cookie set on login, cleared on logout | ✓ |
| Contact form stores in MongoDB | ✓ |
| Account lockout after 10 consecutive failures | ✓ |
| Token invalidated immediately on password change | ✓ |
| Mobile renders correctly (320px+) | ✓ |
| Dark and light modes without flash | ✓ |
| loginThrottle test suite: 24/24 pass | ✓ |
