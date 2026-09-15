import { useState, useEffect, ReactElement } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { DEVELOPER } from '../../data/portfolio'
import { apiFetch, API_BASE } from '../../lib/api'

const INITIALS = DEVELOPER.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const NAV = [
  { label: 'Dashboard',      href: '/admin/dashboard' },
  { label: 'Projects',       href: '/admin/projects' },
  { label: 'Skills',         href: '/admin/skills' },
  { label: 'Education',      href: '/admin/education' },
  { label: 'Experience',     href: '/admin/experience' },
  { label: 'Certifications', href: '/admin/certifications' },
  { label: 'Messages',       href: '/admin/messages' },
]

// ─── Icons ────────────────────────────────────────────────────
const GridIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const FolderIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const ZapIcon       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const BookIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const BriefcaseIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>
const BadgeIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
const MailIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const MoonIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const SunIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const LogOutIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const MenuIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
const ExtIcon       = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>

const NAV_ICONS: Record<string, () => ReactElement> = {
  Dashboard: GridIcon, Projects: FolderIcon, Skills: ZapIcon,
  Education: BookIcon, Experience: BriefcaseIcon, Certifications: BadgeIcon, Messages: MailIcon,
}

// ─── Sidebar ──────────────────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    // Tell the server to clear the httpOnly cookie
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold select-none shrink-0"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg)' }}>{INITIALS}</div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {DEVELOPER.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
              <p className="text-caption" style={{ color: 'var(--text-muted)' }}>Admin</p>
            </div>
          </div>
        </div>
        <Link to="/" onClick={onClose}
          className="inline-flex items-center justify-center gap-1.5 w-full text-caption font-medium px-3 py-2 rounded-lg border transition-colors duration-150"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--surface-elevated)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
          View site <ExtIcon />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5" aria-label="Admin navigation">
        <p className="px-2 mb-2 text-caption font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-muted)' }}>Content</p>
        {NAV.map(item => {
          const Icon = NAV_ICONS[item.label]
          return (
            <NavLink key={item.href} to={item.href} onClick={onClose}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              <Icon />{item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <button type="button" onClick={toggleTheme} className="admin-nav-link w-full text-left"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button type="button" onClick={handleLogout} className="admin-nav-link w-full text-left"
          style={{ color: 'var(--error)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--error-surface)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
          <LogOutIcon />Sign out
        </button>
      </div>
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────
export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked,  setAuthChecked]  = useState(false)

  // Verify the httpOnly cookie is valid on every mount by hitting /auth/me.
  // The cookie is sent automatically — no JS token reads.
  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (!alive) return
        if (!res.ok) { navigate('/admin/login', { replace: true }); return }
        setAuthChecked(true)
      })
      .catch(() => {
        // Network offline — allow through; next API call will 401 if truly invalid
        if (alive) setAuthChecked(true)
      })
    return () => { alive = false }
  }, [navigate])

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Verifying session…</div>
      </div>
    )
  }

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.href))?.label ?? 'Admin'

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" onClick={() => setSidebarOpen(false)}>
          <div className="w-52 h-full border-r flex flex-col"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            onClick={e => e.stopPropagation()}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-5 h-[52px] border-b shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden icon-btn border-0"
              onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar" aria-expanded={sidebarOpen}>
              <MenuIcon />
            </button>
            <h1 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>
          </div>
          <span className="text-caption font-mono px-2 py-1 rounded"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--surface-elevated)' }}>admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-5 md:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
