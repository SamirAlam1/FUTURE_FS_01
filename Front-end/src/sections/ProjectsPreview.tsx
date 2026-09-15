import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/portfolio'

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

type Project = {
  _id?: string
  id?: string
  title: string
  description: string
  category: string
  techStack: string[]
  featured?: boolean
  liveUrl?: string
  githubUrl?: string
  image?: string
  year?: string | number
  order?: number
}

function ArrowUpRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [imageError, setImageError] = useState(false)

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const element = cardRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    element.style.transform =
      `translateY(-3px) perspective(800px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`
  }

  const handleMouseEnter = () => {
    const element = cardRef.current
    if (!element) return

    element.style.boxShadow = 'var(--shadow-lg)'
    element.style.borderColor = 'var(--text-muted)'

    const actions = element.querySelector('[data-actions]') as HTMLElement
    if (actions) {
      actions.style.opacity = '1'
      actions.style.transform = 'translateY(0)'
    }
  }

  const handleMouseLeave = () => {
    const element = cardRef.current
    if (!element) return

    element.style.transform = ''
    element.style.boxShadow = ''
    element.style.borderColor = 'var(--border)'

    const actions = element.querySelector('[data-actions]') as HTMLElement
    if (actions) {
      actions.style.opacity = '0'
      actions.style.transform = 'translateY(-4px)'
    }
  }

  const image = project.image?.trim()
  const key = project._id ?? project.id ?? project.title

  return (
    <article
      ref={cardRef}
      className="reveal flex flex-col rounded-xl border overflow-hidden"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        transition:
          'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), border-color 200ms var(--ease-out)',
        transitionDelay: `${index * 60}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative overflow-hidden"
        style={{
          height: '200px',
          backgroundColor: 'var(--surface-elevated)',
        }}
      >
        {image && !imageError ? (
          <img
            src={image}
            alt={`${project.title} project preview`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
            style={{
              transition: 'transform 600ms var(--ease-out)',
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="text-[12px]">Project preview</span>
          </div>
        )}

        <span
          className="absolute top-3 left-3 text-caption font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            color: '#111',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {project.category}
        </span>

        <div
          data-actions
          className="absolute top-3 right-3 flex gap-1.5"
          style={{
            opacity: 0,
            transform: 'translateY(-4px)',
            transition:
              'opacity 180ms var(--ease-out), transform 180ms var(--ease-out)',
          }}
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: '#111',
                boxShadow: 'var(--shadow-sm)',
              }}
              aria-label={`Open ${project.title} live demo`}
              onClick={e => e.stopPropagation()}
            >
              <ArrowUpRightIcon />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: '#111',
                boxShadow: 'var(--shadow-sm)',
              }}
              aria-label={`Open ${project.title} GitHub repository`}
              onClick={e => e.stopPropagation()}
            >
              <GithubIcon />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-[15px] font-semibold leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.title}
          </h3>

          {project.year && (
            <span
              className="text-caption shrink-0 mt-0.5"
              style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {project.year}
            </span>
          )}
        </div>

        <p
          className="text-small flex-1 mb-4"
          style={{
            color: 'var(--text-muted)',
            lineHeight: '1.65',
          }}
        >
          {project.description.length > 110
            ? `${project.description.slice(0, 108)}…`
            : project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(project.techStack || []).slice(0, 4).map(tech => (
            <span key={tech} className="tech-badge">
              {tech}
            </span>
          ))}

          {project.techStack?.length > 4 && (
            <span className="tech-badge">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline flex items-center gap-1.5 text-small font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Live demo <ArrowUpRightIcon />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline flex items-center gap-1.5 text-small font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <GithubIcon /> Source
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function ProjectsPreview() {
  const ref = useRef<HTMLElement>(null)

  const [projects, setProjects] = useState<Project[]>(
    (PROJECTS as Project[]).filter(project => project.featured).slice(0, 4),
  )

  useEffect(() => {
    let active = true

    fetch(`${API_BASE}/projects`)
      .then(response => {
        if (!response.ok) throw new Error('Unable to fetch projects')
        return response.json()
      })
      .then(result => {
        const all: Project[] = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : []

        const featured = all
          .filter(project => project.featured)
          .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
          .slice(0, 4)

        if (active && featured.length > 0) {
          setProjects(featured)
        }
      })
      .catch(() => {
        // Static PROJECTS remains as fallback.
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return

          entry.target.querySelectorAll('.reveal').forEach((element, index) => {
            setTimeout(
              () => element.classList.add('visible'),
              index * 60,
            )
          })
        })
      },
      { threshold: 0.04 },
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="projects"
      ref={ref}
      className="py-20 md:py-28 border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6 mb-12 reveal">
          <div>
            <div className="section-tag">
              <span className="section-tag-dot" />
              <span className="section-tag-label">Projects</span>
            </div>

            <h2
              className="text-h1"
              style={{
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Selected{' '}
              <span style={{ color: 'var(--accent)' }}>
                work.
              </span>
            </h2>

            <p
              className="text-body"
              style={{ color: 'var(--text-muted)' }}
            >
              Full-stack apps, APIs, and developer tools I'm proud of.
            </p>
          </div>

          <Link
            to="/projects"
            className="link-underline hidden sm:inline-flex items-center gap-2 text-small font-medium shrink-0 mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            All projects <ArrowRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map((project, index) => (
            <ProjectCard
              key={project._id ?? project.id ?? project.title}
              project={project}
              index={index}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:hidden reveal">
          <Link to="/projects" className="btn-outline">
            View all projects <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}