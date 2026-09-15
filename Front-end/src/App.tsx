import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { ThemeProvider } from './contexts/ThemeContext'

import Home from './pages/Home'
import Projects from './pages/Projects'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProjectsList from './pages/admin/ProjectsList'
import SkillsList from './pages/admin/SkillsList'
import EducationList from './pages/admin/EducationList'
import ExperienceList from './pages/admin/ExperienceList'
import CertificationsList from './pages/admin/CertificationList'
import Messages from './pages/admin/Messages'

function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <p
        className="font-bold tracking-tight mb-3"
        style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(48px, 8vw, 80px)',
        }}
      >
        404
      </p>

      <p
        className="text-[17px] mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        This page doesn't exist.
      </p>

      <a
        href="/"
        className="btn-primary"
      >
        Go home
      </a>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ───────────────── Public ───────────────── */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          {/* ─────────────── Admin Authentication ─────────────── */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* ───────────────── Admin ───────────────── */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            {/* /admin → /admin/dashboard */}
            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            {/* Projects CMS */}
            <Route
              path="projects"
              element={<ProjectsList />}
            />

            {/* Skills CMS */}
            <Route
              path="skills"
              element={<SkillsList />}
            />

            {/* Education CMS */}
            <Route
              path="education"
              element={<EducationList />}
            />

            {/* Experience CMS */}
            <Route
              path="experience"
              element={<ExperienceList />}
            />

            {/* Certifications CMS */}
            <Route
              path="certifications"
              element={<CertificationsList />}
            />

            {/* Messages */}
            <Route
              path="messages"
              element={<Messages />}
            />
          </Route>

          {/* ───────────────── 404 ───────────────── */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}