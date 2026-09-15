import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEVELOPER } from '../../data/portfolio'
import { apiFetch } from '../../lib/api'

type RecentMsg = { _id: string; name: string; subject: string; createdAt: string; read: boolean }
type FeaturedProj = { _id?: string; id?: string; title: string; category: string; year?: string | number }
type Stats = {
  projects: number; featuredProjects: number
  skills: number; education: number
  messages: number; unreadMessages: number
}

function StatCard({ label, value, sub, href, accent = false }: {
  label: string; value: number | string; sub?: string; href?: string; accent?: boolean
}) {
  const content = (
    <div
      className="rounded-xl border p-5 transition-all duration-150"
      style={{
        borderColor: accent ? 'var(--accent)' : 'var(--border)',
        backgroundColor: accent ? 'var(--accent-surface)' : 'var(--surface)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        if (!accent) e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--border)'
        if (!accent) e.currentTarget.style.backgroundColor = 'var(--surface)'
      }}
    >
      <p className="text-caption font-medium uppercase tracking-wider mb-3" style={{ color: accent ? 'var(--accent)' : 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-[30px] font-bold tracking-tight leading-none mb-1" style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
  if (href) return <Link to={href} className="block">{content}</Link>
  return content
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentMessages, setRecentMessages] = useState<RecentMsg[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProj[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, skillRes, eduRes, msgRes] = await Promise.allSettled([
          apiFetch('/projects'),
          apiFetch('/skills'),
          apiFetch('/education'),
          apiFetch('/admin/messages'),
        ])

        const safe = (r: PromiseSettledResult<{ok: boolean; data: unknown}>) => {
          if (r.status === 'rejected' || !r.value.ok) return []
          const d = r.value.data as Record<string, unknown>
          return Array.isArray(d) ? d : ((d?.data as unknown[]) ?? [])
        }

        const [projects, skills, education, messages] = await Promise.all([
          safe(projRes), safe(skillRes), safe(eduRes), safe(msgRes),
        ])

        const featured = projects.filter((p: FeaturedProj & { featured?: boolean }) => p.featured)
        setStats({
          projects: projects.length,
          featuredProjects: featured.length,
          skills: skills.length,
          education: education.length,
          messages: messages.length,
          unreadMessages: messages.filter((m: RecentMsg) => !m.read).length,
        })
        setRecentMessages(messages.slice(0, 3))
        setFeaturedProjects(featured.slice(0, 3))
      } catch {
        // Silently fall through — stats stay null, loading ends
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
    catch { return iso }
  }

  return (
    <div className="max-w-[860px] space-y-7">
      {/* Welcome */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Good day, {DEVELOPER.firstName}.
        </h2>
        <p className="text-small mt-1" style={{ color: 'var(--text-muted)' }}>
          Portfolio CMS · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
              <div className="h-3 w-16 rounded mb-3" style={{ backgroundColor: 'var(--surface-elevated)' }} />
              <div className="h-8 w-10 rounded" style={{ backgroundColor: 'var(--surface-elevated)' }} />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Projects" value={stats.projects} sub={`${stats.featuredProjects} featured`} href="/admin/projects" />
          <StatCard label="Skills" value={stats.skills} sub="across all categories" href="/admin/skills" />
          <StatCard label="Education" value={stats.education} sub="entries" href="/admin/education" />
          <StatCard label="Messages" value={stats.messages} sub="received" href="/admin/messages" />
          <StatCard label="Unread" value={stats.unreadMessages} sub="messages" href="/admin/messages" accent={stats.unreadMessages > 0} />
          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <p className="text-caption font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Availability</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
              <span className="text-small font-semibold" style={{ color: 'var(--success)' }}>Open to roles</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-small" style={{ color: 'var(--text-muted)' }}>Stats unavailable — backend may be offline.</p>
        </div>
      )}

      {/* Lower grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent messages */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-small font-semibold" style={{ color: 'var(--text-primary)' }}>Recent messages</p>
            <Link to="/admin/messages" className="text-caption font-medium" style={{ color: 'var(--accent)' }}>View all</Link>
          </div>
          <div>
            {recentMessages.length === 0 ? (
              <p className="px-5 py-6 text-caption text-center" style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
            ) : recentMessages.map((msg, i) => (
              <div key={msg._id} className="px-5 py-3.5 flex items-start gap-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: msg.read ? 'var(--border)' : 'var(--accent)' }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-small font-medium truncate" style={{ color: 'var(--text-primary)' }}>{msg.name}</p>
                    {!msg.read && (
                      <span className="text-caption font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-surface)', color: 'var(--accent)' }}>New</span>
                    )}
                  </div>
                  <p className="text-caption truncate" style={{ color: 'var(--text-muted)' }}>{msg.subject}</p>
                </div>
                <p className="shrink-0 text-caption font-mono" style={{ color: 'var(--text-muted)' }}>{formatDate(msg.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured projects */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-small font-semibold" style={{ color: 'var(--text-primary)' }}>Featured projects</p>
            <Link to="/admin/projects" className="text-caption font-medium" style={{ color: 'var(--accent)' }}>Manage</Link>
          </div>
          <div>
            {featuredProjects.length === 0 ? (
              <p className="px-5 py-6 text-caption text-center" style={{ color: 'var(--text-muted)' }}>No featured projects yet.</p>
            ) : featuredProjects.map((proj, i) => (
              <div key={proj._id ?? proj.id} className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div className="min-w-0">
                  <p className="text-small font-medium truncate" style={{ color: 'var(--text-primary)' }}>{proj.title}</p>
                  <p className="text-caption mt-0.5" style={{ color: 'var(--text-muted)' }}>{proj.category}{proj.year ? ` · ${proj.year}` : ''}</p>
                </div>
                <span className="text-caption font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent-surface)', color: 'var(--accent)' }}>
                  Featured
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Quick actions</p>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: '+ Add project', href: '/admin/projects' },
            { label: '+ Add skill', href: '/admin/skills' },
            { label: '+ Add education', href: '/admin/education' },
            { label: 'View messages', href: '/admin/messages' },
          ].map(action => (
            <Link key={action.label} to={action.href}
              className="text-small font-medium px-4 py-2 rounded-lg border transition-colors duration-150"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'var(--surface)' }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
