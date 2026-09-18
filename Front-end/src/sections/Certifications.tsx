import { useEffect, useRef, useState } from 'react'
import { CERTIFICATIONS } from '../data/portfolio'
import { API_BASE } from '../lib/api'

type CertificationItem = {
  _id?: string
  id?: string
  title: string
  issuer: string
  date: string
  credentialUrl?: string
  order?: number
}

function BadgeCheckIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function Certifications() {
  const ref = useRef<HTMLElement>(null)

  const [certifications, setCertifications] = useState<CertificationItem[]>(
    CERTIFICATIONS as CertificationItem[],
  )

  useEffect(() => {
    fetch(`${API_BASE}/certifications`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch certifications')
        }

        return response.json()
      })
      .then(result => {
        if (Array.isArray(result?.data)) {
          setCertifications(
            [...result.data].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0),
            ),
          )
        }
      })
      .catch(() => {
        // Keep static portfolio data as fallback.
        setCertifications(CERTIFICATIONS as CertificationItem[])
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
      id="certifications"
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
          <span className="section-tag-label">Certifications</span>
        </div>

        {/* Heading */}
        <h2
          className="text-h1 reveal"
          style={{
            color: 'var(--text-primary)',
            maxWidth: '600px',
            marginBottom: '12px',
          }}
        >
          Credentials &{' '}
          <span style={{ color: 'var(--accent)' }}>
            learning.
          </span>
        </h2>

        <p
          className="text-body reveal"
          style={{
            color: 'var(--text-muted)',
            marginBottom: '44px',
          }}
        >
          Formal recognition of technical proficiency across key disciplines.
        </p>

        {/* Certification List */}
        <div
          className="rounded-xl border overflow-hidden reveal"
          style={{ borderColor: 'var(--border)' }}
        >
          {certifications.map((cert, index) => {
            const key =
              cert._id ??
              cert.id ??
              `${cert.title}-${cert.issuer}-${index}`

            const defaultBackground =
              index % 2 === 0
                ? 'var(--surface)'
                : 'var(--bg)'

            return (
              <div
                key={key}
                className="flex items-center gap-4 px-5 py-4 transition-colors duration-150"
                style={{
                  borderTop:
                    index > 0
                      ? '1px solid var(--border)'
                      : 'none',
                  backgroundColor: defaultBackground,
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.backgroundColor =
                    'var(--surface-elevated)'
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.backgroundColor =
                    defaultBackground
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--accent-surface)',
                    color: 'var(--accent)',
                  }}
                >
                  <BadgeCheckIcon />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-medium leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {cert.title}
                  </p>

                  <p
                    className="text-small mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {cert.issuer}
                  </p>
                </div>

                {/* Date + Credential Link */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-[12px] font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {cert.date}
                  </span>

                  {cert.credentialUrl && (
                    
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${cert.title} credential`}
                      className="flex items-center gap-1 text-caption font-medium transition-colors duration-150"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={event => {
                        event.currentTarget.style.color =
                          'var(--accent)'
                      }}
                      onMouseLeave={event => {
                        event.currentTarget.style.color =
                          'var(--text-muted)'
                      }}
                    >
                      View
                      <ExternalLinkIcon />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
