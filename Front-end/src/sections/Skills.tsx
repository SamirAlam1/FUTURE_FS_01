import { useEffect, useRef, useState } from 'react'
import { SKILLS, SKILL_CATEGORIES } from '../data/portfolio'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

type Skill = { _id?: string; id?: string; name: string; category: string; proficiency: number; order?: number }

export default function Skills() {
  const ref = useRef<HTMLElement>(null)
  const [skills, setSkills] = useState<Skill[]>(SKILLS)

  useEffect(() => {
    fetch(`${API_BASE}/skills`)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then(result => {
        if (Array.isArray(result?.data) && result.data.length > 0) {
          setSkills([...result.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
        }
      })
      .catch(() => { /* keep static fallback */ })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
          }
        })
      },
      { threshold: 0.05 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const grouped = SKILL_CATEGORIES.map(cat => ({
    category: cat,
    skills: skills.filter(s => s.category === cat),
  })).filter(g => g.skills.length > 0)

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 md:py-28 border-t"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">

        {/* Tag */}
        <div className="section-tag reveal">
          <span className="section-tag-dot" />
          <span className="section-tag-label">EXPERTISE</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 reveal">
          <div>
            <h2
              className="text-h1"
              style={{ color: 'var(--text-primary)', maxWidth: '520px', marginBottom: '8px' }}
            >
              The tools I{' '}
              <span style={{ color: 'var(--accent)' }}>
                reach for.
              </span>
            </h2>
            <p className="text-body" style={{ color: 'var(--text-muted)' }}>
              Built from shipping real products — deep where it counts, broad enough to own a feature end to end.
            </p>
          </div>
        </div>

        {/* Skill groups */}
        <div className="space-y-0 border rounded-xl overflow-hidden reveal" style={{ borderColor: 'var(--border)' }}>
          {grouped.map((group, gi) => (
            <div
              key={group.category}
              className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 px-5 py-5"
              style={{
                borderTop: gi > 0 ? '1px solid var(--border)' : 'none',
                backgroundColor: gi % 2 === 0 ? 'var(--bg)' : 'var(--surface)',
              }}
            >
              <div className="sm:w-[140px] shrink-0 pt-0.5">
                <p
                  className="text-[12px] font-mono font-medium"
                  style={{ color: 'var(--accent)', letterSpacing: '0.04em' }}
                >
                  {group.category}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(skill => {
                  const key = skill._id ?? skill.id ?? skill.name
                  return (
                    <span key={key} className="skill-pill">
                      {skill.name}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
