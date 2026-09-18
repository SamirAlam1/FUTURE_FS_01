import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { PROJECTS, PROJECT_CATEGORIES } from '../data/portfolio'
import { API_BASE } from '../lib/api'

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
  highlights?: string[]
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--surface-elevated)' }}
      >
        <SearchIcon />
      </div>

      <h3
        className="text-[16px] font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        No projects found
      </h3>

      <p
        className="text-small mb-5"
        style={{ color: 'var(--text-muted)' }}
      >
        {hasFilters
          ? 'Try a different search or filter.'
          : 'No projects available.'}
      </p>

      {hasFilters && (
        <button
          onClick={onClear}
          className="btn-outline"
          style={{ padding: '7px 18px', fontSize: '13px' }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="group flex flex-col rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow =
          '0 12px 32px -8px rgba(0,0,0,0.10)'
        e.currentTarget.style.borderColor = 'var(--text-muted)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{
          height: '188px',
          backgroundColor: 'var(--surface-elevated)',
        }}
      >
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="text-caption font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {project.category}
          </span>

          {project.featured && (
            <span
              className="text-caption font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--accent-surface)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-150 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#111',
              }}
              aria-label="View live demo"
            >
              <ArrowUpRightIcon />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-150 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#111',
              }}
              aria-label="View source code"
            >
              <GithubIcon />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 py-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2
            className="text-[15px] font-semibold leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.title}
          </h2>

          <span
            className="text-[12px] font-mono shrink-0 mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {project.year}
          </span>
        </div>

        <p
          className="text-small flex-1 mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          {project.description}
        </p>

        {project.highlights && project.highlights.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {project.highlights.map(highlight => (
                <span
                  key={highlight}
                  className="text-caption font-medium px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--accent-surface)',
                    color: 'var(--accent-text)',
                  }}
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map(tech => (
            <span key={tech} className="tech-badge">
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div
          className="flex items-center gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-small font-medium transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e =>
                (e.currentTarget.style.color = 'var(--text-primary)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
            >
              Live demo <ArrowUpRightIcon />
            </a>
          ) : (
            <span
              className="text-small"
              style={{ color: 'var(--border)' }}
            >
              No demo
            </span>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-small font-medium transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e =>
                (e.currentTarget.style.color = 'var(--text-primary)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
            >
              <GithubIcon /> Source
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [projects, setProjects] = useState<Project[]>(PROJECTS as Project[])

  useEffect(() => {
    window.scrollTo({ top: 0 })

    fetch(`${API_BASE}/projects`)
      .then(response => {
        if (!response.ok) throw new Error('fetch failed')
        return response.json()
      })
      .then(result => {
        const data: Project[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : []

        if (data.length > 0) setProjects(data)
      })
      .catch(() => {
        /* Keep static fallback */
      })
  }, [])

  const filtered = projects
    .filter(project => {
      const matchCategory =
        category === 'All' || project.category === category

      const query = search.toLowerCase()

      const matchSearch =
        query === '' ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.techStack.some(tech =>
          tech.toLowerCase().includes(query),
        )

      return matchCategory && matchSearch
    })
    .sort((a, b) =>
      sort === 'newest'
        ? Number(b.year) - Number(a.year)
        : Number(a.year) - Number(b.year),
    )

  const hasFilters = search !== '' || category !== 'All'

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <main className="pt-[60px]">
        {/* Page header */}
        <div
          className="border-b py-12 md:py-16"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 mb-5"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="text-small transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
              >
                Home
              </Link>

              <span style={{ color: 'var(--border)' }}>/</span>

              <span
                className="text-small"
                style={{ color: 'var(--text-secondary)' }}
              >
                Projects
              </span>
            </nav>

            <h1
              className="text-h1"
              style={{
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              All{' '}
              <span style={{ color: 'var(--accent)' }}>
                projects.
              </span>
            </h1>

            <p
              className="text-body"
              style={{ color: 'var(--text-secondary)' }}
            >
              {projects.length} projects — full-stack applications, APIs,
              and frontend interfaces.
            </p>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-[360px]">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <SearchIcon />
              </span>

              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base"
                style={{
                  paddingLeft: '38px',
                  paddingRight: search ? '36px' : '14px',
                }}
                aria-label="Search projects"
              />

              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.color =
                      'var(--text-primary)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.color =
                      'var(--text-muted)')
                  }
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by category"
            >
              {PROJECT_CATEGORIES.map(categoryName => (
                <button
                  key={categoryName}
                  onClick={() => setCategory(categoryName)}
                  className="px-3.5 py-2 text-small font-medium rounded-full border transition-colors duration-150"
                  style={{
                    borderColor:
                      category === categoryName
                        ? 'var(--accent)'
                        : 'var(--border)',
                    backgroundColor:
                      category === categoryName
                        ? 'var(--accent-surface)'
                        : 'transparent',
                    color:
                      category === categoryName
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                  }}
                  aria-pressed={category === categoryName}
                >
                  {categoryName}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="sm:ml-auto">
              <select
                value={sort}
                onChange={e =>
                  setSort(e.target.value as 'newest' | 'oldest')
                }
                className="input-base"
                style={{
                  width: '100%',
                  maxWidth: '180px',
                  paddingRight: '32px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
                aria-label="Sort projects"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between mb-6">
            <p
              className="text-small"
              style={{ color: 'var(--text-muted)' }}
            >
              {filtered.length === 0
                ? 'No results'
                : `${filtered.length} project${
                    filtered.length !== 1 ? 's' : ''
                  }`}

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 ml-2 transition-colors duration-150"
                  style={{ color: 'var(--accent)' }}
                >
                  · Clear filters <XIcon />
                </button>
              )}
            </p>
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(project => (
                <ProjectCard
                  key={project.id ?? project._id}
                  project={project}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
