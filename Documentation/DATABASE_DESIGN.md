# Database Design

**Database:** MongoDB  
**ODM:** Mongoose 8.x  
**Status:** As-built — reflects `Back-end/src/models/`

---

## 1. Overview

MongoDB is used as a document store. All collections use Mongoose schemas with `timestamps: true`
(adds `createdAt`, `updatedAt` automatically). All documents have a MongoDB-generated `_id` (ObjectId).

There is no referential integrity between collections — each collection is self-contained.
The `order` field on most collections allows manual display ordering without re-sorting by date.

---

## 2. Collections

### 2.1 `admins`

Stores the single admin user. Created by the seed script.

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | ObjectId | auto | unique | MongoDB default |
| `email` | String | yes | unique, lowercase, trim, email format | Admin login identifier |
| `password` | String | yes | min 8 chars | bcrypt hash (cost 12); `select: false`; stripped via `toJSON` |
| `passwordChangedAt` | Date | no | `select: false`; default `null` | Set by pre-save hook on password change; used to invalidate prior JWTs |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

**Indexes:** `email` (unique)

**Security:**
- `password` and `passwordChangedAt` are excluded from all queries by default (`select: false`)
- `toJSON` method explicitly deletes both fields before serialisation
- Pre-save hook hashes password at cost 12 and sets `passwordChangedAt = Date.now() - 1000` on non-initial saves
- The `- 1000` guard prevents the edge case where a token signed in the same second as a password change would pass the `iat < changedAt` check

---

### 2.2 `projects`

Portfolio projects displayed on the home page and projects page.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `_id` | ObjectId | auto | unique | — |
| `title` | String | yes | trim, max 200 | — |
| `description` | String | yes | trim, max 2000 | — |
| `techStack` | [String] | no | each item max 100 | `[]` |
| `category` | String | yes | enum: see below | — |
| `year` | String | yes | must match `/^\d{4}$/` | — |
| `featured` | Boolean | no | — | `false` |
| `liveUrl` | String | no | must start with `http://` or `https://` | `''` |
| `githubUrl` | String | no | must start with `http://` or `https://` | `''` |
| `image` | String | no | valid URL or relative path; no `javascript:` | `''` |
| `highlights` | [String] | no | each item max 500 chars | `[]` |
| `order` | Number | no | — | `0` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

**Category enum:** `'Full-Stack'`, `'Frontend'`, `'Backend'`, `'Other'`

**URL validation:** `liveUrl`, `githubUrl`, and `image` are validated against `/^https?:\/\/.{3,}/` to prevent `javascript:` URI injection.

**Query patterns:**
- `Project.find({})` — all projects, sorted by `order` then `createdAt` desc
- `Project.find({ category })` — category must pass enum allowlist check in controller before reaching DB
- `Project.find({ featured: true })` — featured only

---

### 2.3 `skills`

Technical skills grouped by category.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `_id` | ObjectId | auto | unique | — |
| `name` | String | yes | trim, max 100 | — |
| `category` | String | yes | enum: see below | — |
| `proficiency` | Number | no | min 0, max 100 | `75` |
| `order` | Number | no | — | `0` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

**Category enum:** `'Languages'`, `'Frontend'`, `'Backend'`, `'Database'`, `'Tools'`

---

### 2.4 `educations`

Academic history entries for the timeline.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-----------|----|
| `_id` | ObjectId | auto | unique | — |
| `institution` | String | yes | trim, max 200 | — |
| `degree` | String | yes | trim, max 150 | — |
| `field` | String | yes | trim, max 150 | — |
| `board` | String | no | trim, max 100 | `''` |
| `startYear` | String | yes | must match `/^\d{4}$/` | — |
| `endYear` | String | yes | must match `/^\d{4}$/` | — |
| `grade` | String | no | trim, max 50 | `''` |
| `description` | String | no | trim, max 1000 | `''` |
| `order` | Number | no | — | `0` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

---

### 2.5 `experiences`

Professional experience entries for the timeline.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-----------|----|
| `_id` | ObjectId | auto | unique | — |
| `company` | String | yes | trim, max 200 | — |
| `role` | String | yes | trim, max 150 | — |
| `type` | String | no | trim, max 50 | `'Full-time'` |
| `startDate` | String | yes | trim, max 50 | — |
| `endDate` | String | yes | trim, max 50 | — |
| `location` | String | no | trim, max 150 | `'Remote'` |
| `description` | String | no | trim, max 1000 | `''` |
| `highlights` | [String] | no | each item max 500 chars | `[]` |
| `order` | Number | no | — | `0` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

---

### 2.6 `certifications`

Professional certifications and courses.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-----------|----|
| `_id` | ObjectId | auto | unique | — |
| `title` | String | yes | trim, max 200 | — |
| `issuer` | String | yes | trim, max 150 | — |
| `date` | String | yes | trim, max 50 | — |
| `credentialUrl` | String | no | must start with `http://` or `https://` | `''` |
| `order` | Number | no | — | `0` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

---

### 2.7 `messages`

Contact form submissions.

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `_id` | ObjectId | auto | unique | — |
| `name` | String | yes | trim, max 100; HTML-stripped before save | — |
| `email` | String | yes | trim, lowercase, email format validated | — |
| `subject` | String | yes | trim, max 200; HTML-stripped before save | — |
| `message` | String | yes | trim, minlength 10, max 5000; HTML-stripped | — |
| `read` | Boolean | no | — | `false` |
| `ip` | String | no | Max 45 chars (IPv6 max); validated as IP-like before storage | `''` |
| `createdAt` | Date | auto | — | — |
| `updatedAt` | Date | auto | — | — |

**HTML stripping:** `name`, `subject`, `message` have all `<tag>` content and `<>` characters removed in the controller before `Message.create()` — prevents stored XSS in the admin message viewer.

**Query patterns:**
- `Message.find({}).sort({ createdAt: -1 }).skip().limit()` — paginated, newest first
- `Message.countDocuments({})` — total for pagination metadata

---

## 3. Sorting Convention

All collections support an `order: Number` field. The standard query sort is:

```js
.sort({ order: 1, createdAt: -1 })
```

Lower `order` values appear first. Within the same `order`, newer entries appear first.

---

## 4. No Joins

MongoDB is used as a document store without joins. Each collection is fully self-contained.

---

## 5. Seed Script

`Back-end/src/seed.js` creates the initial admin document. It:
- Reads credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
- Validates email format and enforces the same password complexity rule as `changePassword`
  (min 8 chars, 1 uppercase, 1 lowercase, 1 digit) — rejecting weak seed passwords
- Exits early if an admin with that email already exists
- Relies on the `Admin` model's pre-save hook to hash the password

---

## 6. Connection

Managed by `Back-end/src/config/db.js`:

```js
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
```

TLS warning is logged if `NODE_ENV=production` and the URI is not `mongodb+srv://` or doesn't include `tls=true`.
