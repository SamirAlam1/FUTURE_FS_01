# Portfolio CMS — Frontend

> React + Vite + Tailwind CSS Portfolio with Admin Dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx     # Admin shell with sidebar
│   │   │   ├── AdminSidebar.jsx    # Navigation sidebar
│   │   │   └── ProtectedRoute.jsx  # JWT route guard
│   │   ├── public/
│   │   │   ├── Navbar.jsx          # Public navbar
│   │   │   └── Footer.jsx
│   │   └── shared/
│   │       ├── LoadingSpinner.jsx
│   │       ├── Toast.jsx           # Notifications
│   │       └── ConfirmDialog.jsx   # Delete confirmation modal
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state & JWT management
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminProjects.jsx   # List + Form
│   │   │   ├── AdminSkills.jsx
│   │   │   ├── AdminEducation.jsx
│   │   │   └── AdminMessages.jsx
│   │   └── public/
│   │       ├── Home.jsx
│   │       ├── About.jsx
│   │       ├── Education.jsx
│   │       ├── Skills.jsx
│   │       ├── Projects.jsx
│   │       └── Contact.jsx
│   ├── utils/
│   │   └── api.js                  # Axios instance with interceptors
│   ├── App.jsx                     # Routes configuration
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Tailwind + global styles
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Set VITE_API_URL to your backend URL
```

Contents of `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start development server
```bash
npm run dev
# App runs on http://localhost:5173
```

### 4. Build for production
```bash
npm run build
# Output in /dist folder
```

---

## Authentication Flow

The app uses **JWT stored in localStorage** for admin authentication.

```
1. Admin visits /admin/login
2. Submits credentials → POST /api/auth/login
3. Token + user stored in localStorage
4. AuthContext provides isAuthenticated state
5. ProtectedRoute checks token before rendering admin pages
6. Axios interceptor auto-attaches Bearer token to all requests
7. On 401 response → auto-logout and redirect to login
```

### Route Protection
```jsx
// ProtectedRoute.jsx
// If not authenticated → redirect to /admin/login
// If token expired → auto-logout (handled by Axios interceptor)
<Route element={<ProtectedRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<Dashboard />} />
    ...
  </Route>
</Route>
```

---

## Public Routes

| Route | Page |
|-------|------|
| `/` | Home (hero section) |
| `/about` | About me |
| `/education` | Education timeline |
| `/skills` | Skills with progress bars |
| `/projects` | Projects grid |
| `/contact` | Contact form |

## Admin Routes (Protected)

| Route | Page |
|-------|------|
| `/admin/login` | Login form |
| `/admin/dashboard` | Stats overview |
| `/admin/projects` | List all projects |
| `/admin/projects/new` | Create project form |
| `/admin/projects/edit/:id` | Edit project form |
| `/admin/skills` | Manage skills |
| `/admin/education` | Manage education |
| `/admin/messages` | View contact messages |

---

## Customization

### Update your name & info
Edit `src/pages/public/Home.jsx` and `About.jsx` with your real information.

### Change theme colors
Edit `tailwind.config.js` to update primary colors.

### Update navbar links
Edit `src/components/public/Navbar.jsx` → `navLinks` array.

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://your-api.onrender.com/api`)
5. Deploy!

> **Important:** Add your Vercel domain to backend's `FRONTEND_URL` for CORS.
