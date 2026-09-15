# Testing Documentation

**Product:** Samir Alam — Developer Portfolio & CMS  
**Version:** 2.0  
**Status:** loginThrottle has an automated test suite; other areas have a manual test plan

---

## 1. Automated Tests

### 1.1 loginThrottle — Self-Contained Test Suite

**File:** `Back-end/src/middleware/loginThrottle.test.js`  
**Run:** `node src/middleware/loginThrottle.test.js`  
**Framework:** None — plain Node.js `assert`  
**Result:** 24 / 24 tests pass

**Coverage:**

| Section | Tests | What's verified |
|---------|-------|-----------------|
| Store helpers | 6 | `recordFailure` increments; `recordSuccess` deletes; separate emails tracked independently; lockout set at 10 failures |
| Middleware pass-through | 5 | Clean account passes; missing email passes; GET passes; locked account returns 429; `Retry-After` header set |
| Finish hook | 5 | 401 increments counter; 200 clears counter; 400 does NOT increment; 10 consecutive 401s trigger lockout; 11th attempt blocked |
| Email normalisation | 2 | `UPPER@CASE.COM` and `upper@case.com` map to same counter; leading/trailing spaces normalised |
| Integration sequence | 4 | First 3 wrong passwords: no delay; 4th password: ≥400ms delay; success resets counter; next failure starts from 1 |
| Timing sanity | 2 | Delay schedule is monotonically increasing; locked response is fast (< 1 s) |

---

## 2. Manual Test Cases

### 2.1 Public Portfolio

| ID | Test | Expected Result |
|----|------|-----------------|
| M-01 | Load `http://localhost:5173` | Hero section renders; typewriter animates |
| M-02 | Click each nav link | Page smoothly scrolls to the correct section |
| M-03 | Scroll page to 50% | Nav pill slides to the correct active link |
| M-04 | Toggle theme button | Dark/light mode switches; persists on reload |
| M-05 | Resize to 320px width | Layout reflows; no horizontal overflow |
| M-06 | Open mobile menu | Overlay slides in; body scroll locked |
| M-07 | Tab through all interactive elements | Focus ring visible on every element |
| M-08 | Load `/projects` | All projects displayed; search and filter work |
| M-09 | Type in project search | Results filter in real time |
| M-10 | Click category filter | Grid updates; active pill highlighted |

### 2.2 Contact Form

| ID | Test | Expected Result |
|----|------|-----------------|
| M-11 | Submit empty form | Validation errors on all fields |
| M-12 | Enter invalid email | "Enter a valid email." error shown |
| M-13 | Enter message under 10 characters | Validation error shown |
| M-14 | Submit valid form | Success state (CheckIcon + "Message sent!") |
| M-15 | Click "Send another" | Form resets to empty state |
| M-16 | Submit form 6 times within one hour | 6th request returns 429 |

### 2.3 Admin Authentication

| ID | Test | Expected Result |
|----|------|-----------------|
| M-17 | Navigate to `/admin/dashboard` when logged out | Redirects to `/admin/login` |
| M-18 | Submit login with wrong password | Error banner shown; no cookie set |
| M-19 | Submit login with empty fields | Client validation errors shown |
| M-20 | Submit valid credentials | Sets `admin_token` httpOnly cookie; redirects to `/admin/dashboard` |
| M-21 | Confirm token NOT in login response body | DevTools → Network → login response body has no `token` field |
| M-22 | Confirm `admin_token` cookie is httpOnly | DevTools → Application → Cookies: `admin_token` has `HttpOnly ✓` |
| M-23 | Confirm `admin_token` cookie is Secure + SameSite=None | DevTools → Application → Cookies: `Secure ✓`, `SameSite: None` |
| M-24 | Navigate to `/admin/login` while session active | Redirects to `/admin/dashboard` (probes /auth/me on mount) |
| M-25 | Click "Sign out" | Cookie cleared; redirects to login; subsequent /auth/me returns 401 |
| M-26 | 3 wrong passwords — no lockout delay | First 3 responses arrive quickly |
| M-27 | 4th wrong password | Response delayed ≥ 400 ms |
| M-28 | 10 consecutive wrong passwords | 11th attempt returns 429 with `Retry-After` header |
| M-28b | Click Sign Out when session cookie has already expired | Cookie is cleared (Set-Cookie: Max-Age=0) and user lands on /admin/login — logout works even with expired token |
| M-29 | Reload page with valid session | AdminLayout calls /auth/me; session verified; dashboard stays visible |
| M-30 | Change password; try old session token | Old token rejected with 401 ("Password was changed — please sign in again") |

### 2.4 Admin CRUD

| ID | Test | Expected Result |
|----|------|-----------------|
| M-31 | Create project with all fields | Project appears in list |
| M-32 | Create project with missing `title` | Validation error |
| M-33 | Submit `liveUrl` as `javascript:alert(1)` | Mongoose validation error — rejected |
| M-34 | Edit project description | Updated value persists after page reload |
| M-35 | Delete project | Project removed; no 404 on reload |
| M-36 | Create project with extra field `_id` in body | Field is silently ignored (mass assignment protection) |
| M-37 | Mark a message as read | `read` indicator updates; unread count decreases on dashboard |
| M-38 | Delete a message | Message removed from list |
| M-39 | Submit contact form with `<script>` in message | Message stored with tags stripped; no `<script>` in admin view |

---

## 3. Recommended Automated Test Setup (Future)

### 3.1 Backend — Unit + Integration Tests

**Tools:** Jest + Supertest + `mongodb-memory-server`

```bash
cd Back-end
npm install --save-dev jest supertest mongodb-memory-server
```

**Priority test files:**
```
Back-end/src/__tests__/
├── auth.test.js          Login cookie, logout, /auth/me, change-password, token invalidation
├── loginThrottle.test.js  Already implemented — move here
├── projects.test.js      CRUD + mass assignment protection + URL validator
├── messages.test.js      Submit + HTML stripping + pagination
└── middleware.test.js    protect (cookie reading, iat check), errorHandler, sanitize
```

**Example — cookie auth test:**
```js
it('sets httpOnly cookie on successful login', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
  expect(res.status).toBe(200)
  expect(res.body.token).toBeUndefined()          // token NEVER in body
  expect(res.headers['set-cookie']).toBeDefined()
  const cookie = res.headers['set-cookie'][0]
  expect(cookie).toContain('HttpOnly')
  expect(cookie).toContain('admin_token=')
})

it('rejects request without cookie', async () => {
  const res = await request(app).get('/api/admin/messages')
  expect(res.status).toBe(401)
})

it('accepts request with valid cookie', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD })
  const cookie = loginRes.headers['set-cookie'][0]
  const res = await request(app)
    .get('/api/admin/messages')
    .set('Cookie', cookie)
  expect(res.status).toBe(200)
})
```

**Example — account throttle integration:**
```js
it('locks account after 10 consecutive failures', async () => {
  for (let i = 0; i < 10; i++) {
    await request(app).post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrong' })
  }
  const res = await request(app).post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: 'wrong' })
  expect(res.status).toBe(429)
  expect(res.headers['retry-after']).toBeDefined()
})
```

### 3.2 Frontend — Component Tests

**Tools:** Vitest + React Testing Library

Priority: `AdminLogin.test.tsx` (no token in localStorage after login), `Contact.test.tsx` (validation), `Projects.test.tsx` (filter/search).

---

## 4. Build Verification

Run before every deployment:

```bash
# Frontend
cd Front-end
npx tsc --noEmit        # Zero TypeScript errors
npm run build           # Must succeed with no warnings

# Backend
cd Back-end
node --check src/server.js       # Syntax check
node --check src/middleware/loginThrottle.js
npm test   # Runs loginThrottle.test.js — 24/24 pass

# Security check: no secrets in frontend bundle
grep -r "JWT\|SECRET\|MONGO\|admin_token" Front-end/dist/ && echo "FAIL" || echo "PASS"
```

---

## 5. Accessibility Audit

| Tool | Command / URL | What it checks |
|------|--------------|----------------|
| axe DevTools | Browser extension | WCAG 2.1 AA violations |
| Lighthouse | `npx lighthouse http://localhost:5173` | Accessibility, SEO, performance |
| Keyboard-only | Manual (Tab, Enter, Space, Esc) | Focus management |

**Minimum targets:** Lighthouse accessibility ≥ 95; zero critical axe violations.
