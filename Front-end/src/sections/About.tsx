import { useEffect, useRef } from 'react'
import { DEVELOPER } from '../data/portfolio'

export default function About() {
  const ref = useRef<HTMLElement>(null)

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

  const principles = [
    'Clean, readable code over clever code',
    'API-first design and clear contracts',
    'Performance is a feature, not an afterthought',
    'Accessibility and usability by default',
  ]

  const snapshot = [
    { label: 'Primary stack',  value: 'MERN + TypeScript' },
    { label: 'Focus area',     value: 'Full-Stack Web' },
    { label: 'Location',       value: DEVELOPER.location },
    { label: 'Status',         value: 'Open to roles' },
    { label: 'Contact',        value: 'sa0409716@gmail.com' },
  ]

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 md:py-28"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">

        {/* Tag */}
        <div className="section-tag reveal">
          <span className="section-tag-dot" />
          <span className="section-tag-label">ABOUT ME</span>
        </div>

        {/* Heading */}
        <h2
          className="text-h1 reveal"
          style={{ color: 'var(--text-primary)', maxWidth: '680px', marginBottom: '40px' }}
        >
          Crafting stories through{' '}
          <span style={{ color: 'var(--accent)' }}>
            web applications
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">

          {/* Bio */}
          <div className="reveal">
            <div
              className="space-y-4 text-body-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              {DEVELOPER.bio.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Principles */}
            <div
              className="mt-8 p-5 rounded-xl border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <p
                className="text-caption font-semibold mb-4"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                Engineering principles
              </p>
              <ul className="space-y-3">
                {principles.map(item => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-small"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Snapshot panel */}
          <div className="reveal">
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
              >
                <p
                  className="text-caption font-semibold"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  At a glance
                </p>
              </div>
              {snapshot.map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span className="text-small" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                  <span
                    className="text-small font-medium text-right"
                    style={{ color: 'var(--text-primary)', maxWidth: '180px', wordBreak: 'break-word' }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote
              className="mt-6 pl-5 border-l-2"
              style={{ borderColor: 'var(--accent)' }}
            >
              <p
                className="text-small leading-relaxed italic"
                style={{ color: 'var(--text-muted)' }}
              >
                "Good software is a conversation between engineering decisions and the people who use the result. I try to make both sides feel considered."
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
