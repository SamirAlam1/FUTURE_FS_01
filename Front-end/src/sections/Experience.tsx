import { useEffect, useRef, useState } from 'react'
import { EXPERIENCE } from '../data/portfolio'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

type ExperienceItem = {
  _id?: string
  id?: string
  company: string
  role: string
  type: string
  startDate: string
  endDate: string
  location: string
  description: string
  highlights: string[]
  order?: number
}

function BriefcaseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  )
}

export default function Experience() {
  const ref = useRef<HTMLElement>(null)
  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    EXPERIENCE as ExperienceItem[],
  )

  useEffect(() => {
    fetch(`${API_BASE}/experience`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch experience')
        }

        return response.json()
      })
      .then(result => {
        if (Array.isArray(result?.data)) {
          setExperiences(
            [...result.data].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0),
            ),
          )
        }
      })
      .catch(() => {
        // Keep static portfolio data as fallback.
        setExperiences(EXPERIENCE as ExperienceItem[])
      })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll('.reveal')
              .forEach(element => element.classList.add('visible'))
          }
        })
      },
      { threshold: 0.05 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="experience"
      ref={ref}
      className="py-20 md:py-28 border-t"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        {/* Tag */}
        <div className="section-tag reveal">
          <span className="section-tag-dot" />
          <span className="section-tag-label">Experience</span>
        </div>

        {/* Heading */}
        <h2
          className="text-h1 reveal"
          style={{
            color: 'var(--text-primary)',
            maxWidth: '640px',
            marginBottom: '12px',
          }}
        >
          Where I've{' '}
          <span style={{ color: 'var(--accent)' }}>
            worked.
          </span>
        </h2>

        <p
          className="text-body reveal"
          style={{
            color: 'var(--text-muted)',
            marginBottom: '44px',
          }}
        >
          Professional experience building and shipping software.
        </p>

        {/* Timeline */}
        <div className="relative reveal">
          <div className="timeline-line hidden sm:block" />

          <div className="space-y-5">
            {experiences.map((exp, index) => {
              const key = exp._id ?? exp.id ?? `${exp.company}-${exp.role}-${index}`

              return (
                <div key={key} className="flex gap-5 sm:gap-8">
                  {/* Dot */}
                  <div className="hidden sm:flex flex-col items-center shrink-0 pt-5">
                    <div className="timeline-dot">
                      <span className="timeline-dot-inner" />
                    </div>
                  </div>

                  {/* Card */}
                  <article
                    className="flex-1 rounded-xl border overflow-hidden"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg)',
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-5 pt-5 pb-4 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: 'var(--accent-surface)',
                            color: 'var(--accent)',
                          }}
                        >
                          <BriefcaseIcon />
                        </div>

                        <div>
                          <p
                            className="text-[16px] font-semibold leading-tight"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {exp.role}
                          </p>

                          <p
                            className="text-small mt-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {exp.company}

                            {exp.location && (
                              <span style={{ color: 'var(--text-muted)' }}>
                                {' · '}
                                {exp.location}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[12px] font-mono"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {exp.startDate} – {exp.endDate}
                        </span>

                        <span
                          className="text-caption font-medium px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: 'var(--accent-surface)',
                            color: 'var(--accent)',
                          }}
                        >
                          {exp.type}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4">
                      {exp.description && (
                        <p
                          className="text-small mb-3"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {exp.description}
                        </p>
                      )}

                      {Array.isArray(exp.highlights) &&
                        exp.highlights.length > 0 && (
                          <ul className="space-y-2">
                            {exp.highlights.map((point, i) => (
                              <li
                                key={`${key}-highlight-${i}`}
                                className="flex items-start gap-2.5 text-small"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <span
                                  className="mt-1.5 shrink-0"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  ·
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
