import { useEffect, useRef, useState } from 'react'
import { EDUCATION } from '../data/portfolio'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

type EducationEntry = {
  id: string
  institution: string
  degree: string
  field: string
  board?: string
  startYear: string
  endYear: string
  grade?: string
  description?: string
}

function GraduationCapIcon() {
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
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

function LoadingState() {
  return (
    <div
      className="flex items-center justify-center py-12 text-small"
      style={{ color: 'var(--text-muted)' }}
    >
      <span
        className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        aria-hidden="true"
      />
      Loading education…
    </div>
  )
}

export default function Education() {
  const ref = useRef<HTMLElement>(null)

  const [entries, setEntries] = useState<EducationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /*
   * Fetch education from MongoDB through the public API.
   * Static EDUCATION remains as a fallback so the section
   * does not become empty if the backend is temporarily unavailable.
   */
  useEffect(() => {
    let cancelled = false

    const loadEducation = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE}/education`)

        if (!response.ok) {
          throw new Error('Unable to load education data')
        }

        const result = await response.json()

        if (cancelled) return

        const data = Array.isArray(result.data) ? result.data : []

        const normalized: EducationEntry[] = data.map(
          (item: Partial<EducationEntry> & { _id?: string }) => ({
            id: item._id ?? item.id ?? crypto.randomUUID(),
            institution: item.institution ?? '',
            degree: item.degree ?? '',
            field: item.field ?? '',
            board: item.board ?? '',
            startYear: item.startYear ?? '',
            endYear: item.endYear ?? '',
            grade: item.grade ?? '',
            description: item.description ?? '',
          }),
        )

        /*
         * If the API is working but database has no entries,
         * show the local portfolio data instead.
         */
        setEntries(normalized.length > 0 ? normalized : EDUCATION)
      } catch {
        if (cancelled) return

        setError('Unable to load live education data.')
        setEntries(EDUCATION)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadEducation()

    return () => {
      cancelled = true
    }
  }, [])

  /*
   * Existing reveal animation.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      observerEntries => {
        observerEntries.forEach(entry => {
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
      id="education"
      ref={ref}
      className="py-20 md:py-28 border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">

        {/* Tag */}
        <div className="section-tag reveal">
          <span className="section-tag-dot" />
          <span className="section-tag-label">CAREER PATH</span>
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
          Where the foundations{' '}
          <span style={{ color: 'var(--accent)' }}>
            were built.
          </span>
        </h2>

        <p
          className="text-body reveal"
          style={{
            color: 'var(--text-muted)',
            marginBottom: '44px',
          }}
        >
          A strong grounding in computer science, systems and software
          engineering.
        </p>

        {/* API error / fallback notice */}
        {error && (
          <div
            className="reveal mb-5 rounded-lg border px-4 py-3 text-small"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-muted)',
            }}
          >
            {error}
          </div>
        )}

        {/* Timeline */}
        <div className="relative reveal">
          <div className="timeline-line hidden sm:block" />

          {loading ? (
            <LoadingState />
          ) : (
            <div className="space-y-5">

              {entries.map(edu => (
                <div
                  key={edu.id}
                  className="flex gap-5 sm:gap-8"
                >

                  {/* Timeline Dot */}
                  <div className="hidden sm:flex flex-col items-center shrink-0 pt-5">
                    <div className="timeline-dot">
                      <span className="timeline-dot-inner" />
                    </div>
                  </div>

                  {/* Education Card */}
                  <article
                    className="flex-1 rounded-xl border overflow-hidden"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >

                    {/* Header */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-5 pb-4 border-b"
                      style={{
                        borderColor: 'var(--border)',
                      }}
                    >

                      <div className="flex items-center gap-3">

                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: 'var(--accent-surface)',
                            color: 'var(--accent)',
                          }}
                        >
                          <GraduationCapIcon />
                        </div>

                        {/* Education title */}
                        <div className="min-w-0">

                          <p
                            className="text-[16px] font-semibold leading-tight"
                            style={{
                              color: 'var(--text-primary)',
                            }}
                          >
                            {edu.institution}
                          </p>

                          <p
                            className="text-small mt-0.5"
                            style={{
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {edu.degree}
                            {edu.field && ` · ${edu.field}`}
                          </p>

                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">

                        <span
                          className="text-[12px] font-mono"
                          style={{
                            color: 'var(--text-muted)',
                          }}
                        >
                          {edu.startYear} – {edu.endYear}
                        </span>

                        {edu.board && (
                          <span
                            className="text-caption font-medium px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: 'var(--accent-surface)',
                              color: 'var(--accent)',
                            }}
                          >
                            {edu.board}
                          </span>
                        )}

                        {edu.grade && (
                          <span
                            className="text-caption font-medium px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: 'var(--accent-surface)',
                              color: 'var(--accent)',
                            }}
                          >
                            {edu.grade}
                          </span>
                        )}

                      </div>
                    </div>

                    {/* Body */}
                    {edu.description && (
                      <div className="px-5 py-4">
                        <ul className="space-y-2">
                          {edu.description
                            .split(/\. (?=[A-Z0-9])/)
                            .map(point => point.trim())
                            .filter(Boolean)
                            .map((point, index) => (
                              <li
                                key={`${edu.id}-${index}`}
                                className="flex items-start gap-2.5 text-small"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <span
                                  className="mt-1.5 shrink-0"
                                  style={{
                                    color: 'var(--accent)',
                                  }}
                                  aria-hidden="true"
                                >
                                  ·
                                </span>

                                <span>
                                  {point.endsWith('.')
                                    ? point
                                    : `${point}.`}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  </article>
                </div>
              ))}

              {/* Empty state */}
              {entries.length === 0 && (
                <div
                  className="rounded-xl border border-dashed px-5 py-10 text-center"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  No education information available.
                </div>
              )}

              {/* Ongoing */}
              <div className="flex gap-5 sm:gap-8">

                <div className="hidden sm:flex flex-col items-center shrink-0 pt-4 w-[23px]">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: 'var(--border)',
                      border: '2px solid var(--bg)',
                    }}
                  />
                </div>

                <div
                  className="flex-1 px-5 py-4 rounded-xl text-small leading-relaxed"
                  style={{
                    border: '1px dashed var(--accent)',
                    backgroundColor: 'var(--accent-surface)',
                    color: 'var(--accent-text)',
                  }}
                >
                  Ongoing learning through open-source contribution,
                  technical documentation, and personal projects.
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </section>
  )
}