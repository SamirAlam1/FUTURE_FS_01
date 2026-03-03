# 🚀 Portfolio CMS — A Full Stack MERN Application

A **production-ready** developer portfolio website with a protected admin dashboard built with the MERN stack.

![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

**Public Portfolio Website**
- Hero section with animated intro
- About page with personal info
- Education timeline (fetched from DB)
- Skills page with animated progress bars (fetched from DB)
- Projects gallery with live/GitHub links (fetched from DB)
- Blog with Markdown-rendered posts (fetched from DB)
- Contact form (saves to DB)

**Admin Dashboard (Protected)**
- JWT-secured login
- Dashboard with stats overview
- Full CRUD for: Projects, Skills, Education, Blog Posts
- View, read, and delete contact messages
- Toggle blog publish status

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT + bcryptjs |
| **Deployment** | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 📁 Project Structure

```
portfolio-cms/
├── backend/                # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   │   └── seed.js
│   ├── .env.example
│   ├── server.js
│   └── README.md
│
├── frontend/               # React App
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   ├── vite.config.js
│   └── README.md
│
└── README.md               # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas account)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/portfolio-cms.git
cd portfolio-cms
```

### Step 2: Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed        # Creates admin user + sample data
npm run dev         # Starts on http://localhost:5000
```

### Step 3: Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev         # Starts on http://localhost:5173
```

### Step 4: Login to Admin
- URL: `http://localhost:5173/admin/login`
- Email: `admin@portfolio.com`
- Password: `Admin@123456`

---

## 🗄 Database Models

### User
```
name, email, password (hashed), role
```

### Project
```
title, description, techStack[], liveUrl, githubUrl, imageUrl, featured, order
```

### Skill
```
name, category (Frontend/Backend/DB/DevOps/Tools), level (1-100), icon, order
```

### Education
```
institution, degree, fieldOfStudy, startYear, endYear, grade, description
```

### Blog
```
title, slug (auto), excerpt, content (Markdown), tags[], coverImage, published, readTime
```

### Message
```
name, email, subject, message, read (bool)
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/login → returns { token, user }
2. Token stored in localStorage
3. Axios interceptor adds Authorization: Bearer <token> header
4. Backend auth.js middleware verifies token on protected routes
5. On 401 → auto logout + redirect to /admin/login
6. Token expires after 7 days (configurable via JWT_EXPIRE)
```

---

## 🌐 Deployment Guide

### MongoDB Atlas (Database)
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (allows all)
5. Copy connection string → paste into backend `.env` as `MONGO_URI`

### Render (Backend)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root to `backend/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (from `.env`)
7. Note your service URL: `https://your-api.onrender.com`

### Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com/api`
5. Deploy!
6. Copy your Vercel URL and add it to backend's `FRONTEND_URL` environment variable on Render

---

## 📖 API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require header:
```
Authorization: Bearer <your_jwt_token>
```

| Resource | Public Endpoints | Protected Endpoints |
|----------|-----------------|---------------------|
| Auth | `POST /auth/login` | `GET /auth/me` |
| Projects | `GET /projects`, `GET /projects/:id` | `POST`, `PUT`, `DELETE /projects` |
| Skills | `GET /skills` | `POST`, `PUT`, `DELETE /skills` |
| Education | `GET /education` | `POST`, `PUT`, `DELETE /education` |
| Blogs | `GET /blogs`, `GET /blogs/:id` | `POST`, `PUT`, `DELETE /blogs` |
| Messages | `POST /messages` | `GET`, `PUT`, `DELETE /messages` |

---

## 🎨 Customization Checklist

- [ ] Update your name in `frontend/src/pages/public/Home.jsx`
- [ ] Update your bio in `frontend/src/pages/public/About.jsx`
- [ ] Update email in `frontend/src/pages/public/Contact.jsx`
- [ ] Update social links in `frontend/src/components/public/Footer.jsx`
- [ ] Update GitHub/LinkedIn links in the navbar
- [ ] Add your real projects, skills, and education via the admin panel
- [ ] Change theme colors in `tailwind.config.js`

---

## 🐛 Troubleshooting

**CORS error?**
→ Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly.

**MongoDB connection failed?**
→ Check your `MONGO_URI`, whitelist your IP in Atlas, and verify credentials.

**Admin login not working?**
→ Run `npm run seed` in the backend to create the admin user.

**Frontend not hitting the API?**
→ Check `VITE_API_URL` in your `.env` file.

---

## 📄 License

MIT License — free to use for personal and commercial projects.
