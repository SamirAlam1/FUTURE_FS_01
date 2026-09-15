import { useEffect, useState } from 'react'
import { PROJECTS, type Project } from '../../data/portfolio'
import { apiFetch } from '../../lib/api'

type ApiProject = Project & {
  _id?: string
}

type FormData = Omit<Project, 'id'> & {
  id?: string
  _id?: string
}

const emptyForm: FormData = {
  title: '',
  description: '',
  techStack: [],
  category: 'Full-Stack',
  year: new Date().getFullYear().toString(),
  featured: false,
  liveUrl: '',
  githubUrl: '',
  image: '',
  highlights: [],
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function inputClass(error = false) {
  return `input-base${error ? ' has-error' : ''}`
}

async function apiRequest<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
  const { ok, data } = await apiFetch<T>(path, options)
  if (!ok) throw new Error(((data as Record<string, unknown>)?.message as string) || 'Request failed')
  return data
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<ApiProject[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [techInput, setTechInput] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await apiRequest('/projects')
      const data = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : []

      setProjects(data)
    } catch {
      setError('Unable to load projects from server.')
      setProjects(PROJECTS as ApiProject[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const filtered = projects.filter(project => {
    const query = search.toLowerCase()

    return (
      project.title.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query)
    )
  })

  const openNew = () => {
    setForm({
      ...emptyForm,
      techStack: [],
      highlights: [],
    })
    setEditingId(null)
    setTechInput('')
    setError('')
    setShowForm(true)
  }

  const openEdit = (project: ApiProject) => {
    setForm({
      ...emptyForm,
      ...project,
      techStack: [...(project.techStack || [])],
      highlights: [...(project.highlights || [])],
    })

    setEditingId(project._id || project.id || null)
    setTechInput('')
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Project title is required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const id = editingId

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        category: form.category,
        year: String(form.year || ''),
        techStack: form.techStack || [],
        featured: !!form.featured,
        liveUrl: form.liveUrl?.trim() || '',
        githubUrl: form.githubUrl?.trim() || '',
        image: form.image?.trim() || '',
        highlights: form.highlights || [],
      }

      const result = await apiRequest<{ success: boolean; data: ApiProject }>(
        id ? `/admin/projects/${id}` : '/admin/projects',
        {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      )

      const savedProject: ApiProject = result.data

      if (id) {
        setProjects(current =>
          current.map(project =>
            (project._id || project.id) === id ? savedProject : project,
          ),
        )
      } else {
        setProjects(current => [savedProject, ...current])
      }

      setSavedId(savedProject._id || savedProject.id || null)
      setShowForm(false)
      setForm(emptyForm)

      setTimeout(() => setSavedId(null), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setError('')

      await apiRequest(`/admin/projects/${id}`, {
        method: 'DELETE',
      })

      setProjects(current =>
        current.filter(project => (project._id || project.id) !== id),
      )

      setDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete project.')
    }
  }

  const addTech = () => {
    const tech = techInput.trim()

    if (!tech || form.techStack.includes(tech)) return

    setForm(current => ({
      ...current,
      techStack: [...current.techStack, tech],
    }))

    setTechInput('')
  }

  const removeTech = (tech: string) => {
    setForm(current => ({
      ...current,
      techStack: current.techStack.filter(item => item !== tech),
    }))
  }

  const toggleFeatured = async (project: ApiProject) => {
    const id = project._id || project.id

    if (!id) return

    try {
      setError('')

      const result = await apiRequest<{ success: boolean; data: ApiProject }>(`/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          featured: !project.featured,
        }),
      })

      setProjects(current =>
        current.map(item =>
          (item._id || item.id) === id ? result.data : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update project.')
    }
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-[20px] font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Projects
          </h2>

          <p
            className="text-[13px] mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {projects.length} total · {projects.filter(p => p.featured).length} featured
          </p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          <PlusIcon />
          Add project
        </button>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-lg text-[13px]"
          style={{
            backgroundColor: 'var(--error-surface)',
            color: 'var(--error)',
          }}
        >
          {error}
        </div>
      )}

      {savedId && (
        <div
          className="px-4 py-3 rounded-lg text-[13px]"
          style={{
            backgroundColor: 'var(--success-surface)',
            color: 'var(--success)',
          }}
        >
          Project saved successfully.
        </div>
      )}

      <div className="relative max-w-sm">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        >
          <SearchIcon />
        </span>

        <input
          placeholder="     Search projects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                {['Project', 'Category', 'Year', 'Featured', 'Actions'].map(title => (
                  <th
                    key={title}
                    className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((project, index) => {
                const id = project._id || project.id || project.title

                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom:
                        index < filtered.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt=""
                            className="w-10 h-10 rounded-md object-cover border"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundColor: 'var(--surface-elevated)',
                            }}
                          />
                        )}

                        <div>
                          <p
                            className="font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {project.title}
                          </p>

                          <p
                            className="text-[12px] mt-0.5 line-clamp-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {(project.techStack || []).slice(0, 3).join(', ')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{
                          backgroundColor: 'var(--surface-elevated)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {project.category}
                      </span>
                    </td>

                    <td
                      className="px-4 py-3 font-mono text-[12px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {project.year}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(project)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: project.featured
                            ? 'var(--accent-surface)'
                            : 'var(--surface-elevated)',
                          color: project.featured
                            ? 'var(--accent)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {project.featured ? 'Featured' : 'Draft'}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          className="w-7 h-7 flex items-center justify-center rounded border"
                          style={{
                            color: 'var(--text-muted)',
                            borderColor: 'var(--border)',
                          }}
                          aria-label="Edit project"
                        >
                          <EditIcon />
                        </button>

                        <button
                          onClick={() => setDeleteId(id)}
                          className="w-7 h-7 flex items-center justify-center rounded border"
                          style={{
                            color: 'var(--error)',
                            borderColor: 'var(--border)',
                          }}
                          aria-label="Delete project"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {loading && (
          <div
            className="px-4 py-10 text-center text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading projects…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            className="px-4 py-10 text-center text-[14px]"
            style={{ color: 'var(--text-muted)' }}
          >
            No projects found.
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <h3
                className="text-[16px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {editingId ? 'Edit project' : 'New project'}
              </h3>

              <button
                onClick={() => setShowForm(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                <XIcon />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Title *
                </label>

                <input
                  value={form.title}
                  onChange={e =>
                    setForm(current => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Project title"
                  className={inputClass(!form.title.trim())}
                />
              </div>

              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={e =>
                    setForm(current => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Project description…"
                  rows={3}
                  className={inputClass()}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[12px] font-semibold mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={e =>
                      setForm(current => ({
                        ...current,
                        category: e.target.value,
                      }))
                    }
                    className={inputClass()}
                  >
                    <option>Full-Stack</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[12px] font-semibold mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Year
                  </label>

                  <input
                    value={form.year}
                    onChange={e =>
                      setForm(current => ({
                        ...current,
                        year: e.target.value,
                      }))
                    }
                    placeholder="2026"
                    className={inputClass()}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Tech stack
                </label>

                <div className="flex gap-2 mb-2">
                  <input
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTech()
                      }
                    }}
                    placeholder="Add technology…"
                    className={inputClass()}
                    style={{ flex: 1 }}
                  />

                  <button
                    type="button"
                    onClick={addTech}
                    className="px-3 py-2 text-[13px] font-medium rounded-lg"
                    style={{
                      backgroundColor: 'var(--accent-surface)',
                      color: 'var(--accent)',
                    }}
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {form.techStack.map(tech => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 text-[12px] font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--surface-elevated)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {tech}

                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Project Image URL
                </label>

                <input
                  type="url"
                  value={form.image || ''}
                  onChange={e =>
                    setForm(current => ({
                      ...current,
                      image: e.target.value,
                    }))
                  }
                  placeholder="https://res.cloudinary.com/..."
                  className={inputClass()}
                />

                <p
                  className="text-[11px] mt-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Use a direct public image URL.
                </p>

                {form.image && (
                  <div className="mt-3">
                    <img
                      src={form.image}
                      alt="Project preview"
                      className="w-full h-32 object-cover rounded-lg border"
                      style={{ borderColor: 'var(--border)' }}
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[12px] font-semibold mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Live URL
                  </label>

                  <input
                    type="url"
                    value={form.liveUrl || ''}
                    onChange={e =>
                      setForm(current => ({
                        ...current,
                        liveUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label
                    className="block text-[12px] font-semibold mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    GitHub URL
                  </label>

                  <input
                    type="url"
                    value={form.githubUrl || ''}
                    onChange={e =>
                      setForm(current => ({
                        ...current,
                        githubUrl: e.target.value,
                      }))
                    }
                    placeholder="https://github.com/..."
                    className={inputClass()}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={e =>
                    setForm(current => ({
                      ...current,
                      featured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--accent)' }}
                />

                <label
                  htmlFor="featured"
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Feature on homepage
                </label>
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[13px] font-medium rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {saving
                  ? 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-[360px] rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="text-[16px] font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Delete project?
            </h3>

            <p
              className="text-[13px] mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              "{projects.find(project => (project._id || project.id) === deleteId)?.title}"
              will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-[13px] font-medium rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 text-[13px] font-semibold rounded-lg"
                style={{
                  backgroundColor: 'var(--error)',
                  color: '#fff',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}