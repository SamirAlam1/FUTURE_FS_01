# API Reference

**Base URL (production):** `https://api.samiralam.dev/api`  
**Base URL (development):** `http://localhost:5000/api`

All responses follow this shape:
```json
{ "success": true | false, "data": ..., "message": "..." }
```

Authentication is cookie-based. The server sets an `httpOnly; Secure; SameSite=None` cookie
named `admin_token` on login. All admin requests must be made with `credentials: 'include'`
so the browser sends this cookie automatically. No `Authorization` header is used.

---

## Authentication

### POST /auth/login
Authenticate the admin. On success, sets an `httpOnly` `admin_token` cookie.

**Rate limits:**
- IP-level: 10 failures / 15 min per IP (`skipSuccessfulRequests: true`)
- Account-level: progressive delay (500 ms → 15 s) after 3 failures; hard 15-min lockout after 10

**Request body:**
```json
{ "email": "admin@example.com", "password": "yourPassword1" }
```

**Response 200:**
```json
{ "success": true, "admin": { "id": "...", "email": "admin@example.com" } }
```
Token is NOT returned in the response body. It is set as an `httpOnly` cookie only.

**Response 401:** `{ "success": false, "message": "Invalid credentials" }`

**Response 429 (account locked):**
```json
{
  "success": false,
  "message": "Account temporarily locked due to too many failed attempts. Try again in 15 minute(s)."
}
```
Includes `Retry-After: <seconds>` response header.

---

### POST /auth/logout
Clear the `admin_token` cookie. Protected.

**Response 200:** `{ "success": true, "message": "Logged out" }`

---

### GET /auth/me
Get the currently authenticated admin. Protected.

**Response 200:**
```json
{ "success": true, "admin": { "_id": "...", "email": "...", "createdAt": "..." } }
```

---

### POST /auth/change-password
Change the admin password. Protected. Invalidates all previously issued tokens and issues
a fresh cookie so the current session remains alive.

**Request body:**
```json
{ "currentPassword": "old", "newPassword": "NewPass123" }
```

**Password rules:** min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit. Must differ from current.

**Response 200:** `{ "success": true, "message": "Password updated successfully" }`
A new `admin_token` cookie is set in the response.

---

## Projects

### GET /projects
List all projects. Public.

**Query params:**
- `category` — Filter: `Full-Stack`, `Frontend`, `Backend`, `Other`
- `featured=true` — Return only featured projects

**Response 200:**
```json
{ "success": true, "count": 6, "data": [{ "_id": "...", "title": "...", "featured": true }] }
```

---

### GET /projects/:id
Get a single project by ID. Public.

---

### POST /admin/projects
Create a project. Protected.

**Request body:**
```json
{
  "title": "My App",
  "description": "Description here",
  "techStack": ["React", "Node.js"],
  "category": "Full-Stack",
  "year": "2024",
  "featured": true,
  "liveUrl": "https://...",
  "githubUrl": "https://...",
  "image": "https://...",
  "highlights": ["Feature A", "Feature B"],
  "order": 0
}
```
Only whitelisted fields are accepted. `_id`, `__v`, and timestamp fields are ignored if sent.

---

### PUT /admin/projects/:id
Update a project. Protected. Same body as POST (partial updates accepted).

---

### DELETE /admin/projects/:id
Delete a project. Protected.

---

## Skills

### GET /skills
List all skills (public).

### POST /admin/skills (protected)
```json
{ "name": "React", "category": "Frontend", "proficiency": 90, "order": 0 }
```
Categories: `Languages`, `Frontend`, `Backend`, `Database`, `Tools`

### PUT /admin/skills/:id (protected)
### DELETE /admin/skills/:id (protected)

---

## Education

### GET /education (public)
### POST /admin/education (protected)
```json
{
  "institution": "University Name",
  "degree": "Bachelor of Technology",
  "field": "Computer Science",
  "startYear": "2020",
  "endYear": "2024",
  "grade": "8.5 CGPA",
  "description": "...",
  "order": 0
}
```
### PUT /admin/education/:id (protected)
### DELETE /admin/education/:id (protected)

---

## Experience

### GET /experience (public)
### POST /admin/experience (protected)
```json
{
  "company": "Company Name",
  "role": "Full-Stack Developer Intern",
  "type": "Internship",
  "startDate": "Jun 2023",
  "endDate": "Aug 2023",
  "location": "Remote",
  "description": "...",
  "highlights": ["Built X", "Improved Y"],
  "order": 0
}
```
### PUT /admin/experience/:id (protected)
### DELETE /admin/experience/:id (protected)

---

## Certifications

### GET /certifications (public)
### POST /admin/certifications (protected)
```json
{
  "title": "MongoDB Developer Path",
  "issuer": "MongoDB University",
  "date": "2023",
  "credentialUrl": "https://...",
  "order": 0
}
```
`credentialUrl` must be a valid `http://` or `https://` URL if provided.

### PUT /admin/certifications/:id (protected)
### DELETE /admin/certifications/:id (protected)

---

## Contact

### POST /contact
Submit a contact message. Public.

**Rate limit:** 5 requests / hour per IP

**Request body:**
```json
{
  "name": "Jane Cooper",
  "email": "jane@example.com",
  "subject": "Collaboration opportunity",
  "message": "Hi Samir, I'd like to discuss..."
}
```

Field limits: `name` ≤ 100 chars, `subject` ≤ 200 chars, `message` 10–5000 chars.
HTML tags are stripped from all text fields before storage.

**Response 201:** `{ "success": true, "message": "Message received — thank you!" }`

---

## Messages (Admin)

### GET /admin/messages
List all contact messages. Protected. Paginated.

**Query params:** `page` (default 1), `limit` (default 20, max 50)

**Response 200:**
```json
{
  "success": true,
  "count": 20,
  "total": 47,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

### PATCH /admin/messages/:id/read
Mark a message as read. Protected.

### DELETE /admin/messages/:id
Delete a message. Protected.

---

## Error Codes

| Code | Meaning                          |
|------|----------------------------------|
| 400  | Bad request / validation failed  |
| 401  | Unauthorised / invalid/expired session |
| 403  | Forbidden (CORS)                 |
| 404  | Resource not found               |
| 409  | Conflict (duplicate key)         |
| 429  | Too many requests / account locked |
| 500  | Internal server error            |

In production, 5xx responses never include a stack trace.
