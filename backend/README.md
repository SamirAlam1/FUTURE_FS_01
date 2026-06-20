# Portfolio CMS — Backend API

> Node.js + Express + MongoDB REST API with JWT Authentication

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Logging | Morgan |

---

## Folder Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Login, profile, password
│   ├── projectController.js
│   ├── skillController.js
│   ├── educationController.js
│   └── messageController.js
├── middleware/
│   ├── auth.js             # JWT protect middleware
│   └── errorHandler.js     # Global error handler
|   └── validate.js
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Skill.js
│   ├── Education.js
│   └── Message.js
├── routes/
│   ├── auth.js
│   ├── projects.js
│   ├── skills.js
│   ├── education.js
│   └── messages.js
├── utils/
│   └── seed.js             # Database seeder
├── .env.example
├── package.json
└── server.js               # Entry point
```

---

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
```

### 3. Seed the database (creates admin + sample data)
```bash
npm run seed
```

### 4. Start development server
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRE` | Token expiry duration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Seed admin email | `admin@portfolio.com` |
| `ADMIN_PASSWORD` | Seed admin password | `Admin@123456` |

---

## API Reference

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/login` | Public | Admin login |
| `GET` | `/api/auth/me` | Private | Get current user |
| `PUT` | `/api/auth/update-profile` | Private | Update profile |
| `PUT` | `/api/auth/change-password` | Private | Change password |

### Projects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects` | Public | Get all projects |
| `GET` | `/api/projects/:id` | Public | Get single project |
| `POST` | `/api/projects` | Private | Create project |
| `PUT` | `/api/projects/:id` | Private | Update project |
| `DELETE` | `/api/projects/:id` | Private | Delete project |

### Skills

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/skills` | Public | Get all skills |
| `GET` | `/api/skills/:id` | Public | Get single skill |
| `POST` | `/api/skills` | Private | Create skill |
| `PUT` | `/api/skills/:id` | Private | Update skill |
| `DELETE` | `/api/skills/:id` | Private | Delete skill |

### Education

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/education` | Public | Get all education |
| `POST` | `/api/education` | Private | Create entry |
| `PUT` | `/api/education/:id` | Private | Update entry |
| `DELETE` | `/api/education/:id` | Private | Delete entry |

### Messages (Contact Form)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/messages` | Public | Submit contact form |
| `GET` | `/api/messages` | Private | Get all messages |
| `PUT` | `/api/messages/:id/read` | Private | Toggle read status |
| `DELETE` | `/api/messages/:id` | Private | Delete message |

---

## Authentication Flow

1. Admin POSTs `/api/auth/login` with `{email, password}`
2. Server verifies credentials and returns `{token, user}`
3. Frontend stores token in `localStorage`
4. Every protected request sends `Authorization: Bearer <token>`
5. `auth.js` middleware decodes the JWT and attaches `req.user`

---

## Deployment (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables in Render dashboard
7. Done! Your API URL will be `https://your-service.onrender.com`
