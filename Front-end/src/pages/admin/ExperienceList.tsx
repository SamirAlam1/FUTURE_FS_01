import { FormEvent, useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

interface Experience {
  _id?: string
  company: string
  role: string
  type: string
  startDate: string
  endDate: string
  location: string
  description: string
  highlights: string[]
  order: number
}

interface FormData {
  company: string
  role: string
  type: string
  startDate: string
  endDate: string
  location: string
  description: string
  highlights: string
  order: number
}

interface ApiResponse<T = unknown> {
  success?: boolean
  data?: T
  message?: string
}

const TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
  'Remote',
]

const EMPTY_FORM: FormData = {
  company: '',
  role: '',
  type: 'Full-time',
  startDate: '',
  endDate: '',
  location: 'Remote',
  description: '',
  highlights: '',
  order: 0,
}

const inputClass =
  'h-14 w-full rounded-xl border border-border bg-white px-4 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-[#287f70] focus:ring-1 focus:ring-[#287f70] dark:bg-[#171716]'

const textAreaClass =
  'w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-base leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-[#287f70] focus:ring-1 focus:ring-[#287f70] dark:bg-[#171716]'

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
}: {
  label: string
  id: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
        className={inputClass}
      />
    </div>
  )
}

function TextAreaField({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={textAreaClass}
      />

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadExperiences = async () => {
    try {
      setLoading(true)

      const response = await apiFetch<ApiResponse<Experience[]>>(
        '/experience',
      )

      if (response.ok && response.data?.success) {
        setExperiences(response.data.data ?? [])
      }
    } catch (error) {
      console.error('Failed to load experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperiences()
  }, [])

  const update = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (item: Experience) => {
    setEditingId(item._id ?? null)

    setForm({
      company: item.company ?? '',
      role: item.role ?? '',
      type: item.type ?? 'Full-time',
      startDate: item.startDate ?? '',
      endDate: item.endDate ?? '',
      location: item.location ?? 'Remote',
      description: item.description ?? '',
      highlights: item.highlights?.join('\n') ?? '',
      order: item.order ?? 0,
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.company.trim() || !form.role.trim()) {
      alert('Company and Role are required.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        type: form.type,
        startDate: form.startDate.trim(),
        endDate: form.endDate.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        highlights: form.highlights
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        order: Number(form.order) || 0,
      }

      const endpoint = editingId
        ? `/admin/experience/${editingId}`
        : '/admin/experience'

      const response = await apiFetch<ApiResponse>(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(
          response.data?.message ?? 'Failed to save experience.',
        )
      }

      await loadExperiences()

      setShowModal(false)
      setEditingId(null)
      setForm({ ...EMPTY_FORM })
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Delete this experience?')) {
      return
    }

    try {
      const response = await apiFetch<ApiResponse>(
        `/admin/experience/${id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error(
          response.data?.message ?? 'Failed to delete experience.',
        )
      }

      await loadExperiences()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Experience
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {experiences.length}{' '}
            {experiences.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#287f70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236f62]"
        >
          <span className="text-lg leading-none">+</span>
          Add entry
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading experiences...
        </div>
      ) : experiences.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No experience entries yet.
          </p>

          <button
            type="button"
            onClick={openAdd}
            className="mt-4 rounded-xl bg-[#287f70] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#236f62]"
          >
            + Add entry
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {experiences.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.role}
                  </h3>

                  <p className="mt-1 text-base text-muted-foreground">
                    {item.company}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {item.type && <span>{item.type}</span>}

                    {item.startDate && (
                      <>
                        <span className="text-muted-foreground">
                          •
                        </span>

                        <span>
                          {item.startDate}
                          {item.endDate
                            ? ` – ${item.endDate}`
                            : ''}
                        </span>
                      </>
                    )}

                    {item.location && (
                      <>
                        <span className="text-muted-foreground">
                          •
                        </span>

                        <span>{item.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    aria-label={`Edit ${item.role}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    aria-label={`Delete ${item.role}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-red-600 transition hover:border-red-200 hover:bg-red-50"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.highlights?.length > 0 && (
                <ul className="mt-4 space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                  {item.highlights.map((highlight, index) => (
                    <li key={index} className="list-disc">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal()
            }
          }}
        >
          <div
            className="flex w-full max-w-[680px] max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-[#171716] sm:max-h-[calc(100vh-2rem)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <h3 className="text-xl font-medium tracking-tight">
                  {editingId
                    ? 'Edit experience entry'
                    : 'New experience entry'}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add a new professional experience.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-2xl leading-none text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-5">
                  <Field
                    label="Company"
                    id="company"
                    value={form.company}
                    onChange={(value) => update('company', value)}
                    placeholder="e.g. Google"
                    required
                  />

                  <Field
                    label="Role"
                    id="role"
                    value={form.role}
                    onChange={(value) => update('role', value)}
                    placeholder="e.g. Full Stack Developer"
                    required
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="type"
                        className="text-sm font-medium"
                      >
                        Type
                      </label>

                      <select
                        id="type"
                        value={form.type}
                        onChange={(e) =>
                          update('type', e.target.value)
                        }
                        className={inputClass}
                      >
                        {TYPES.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <Field
                      label="Location"
                      id="location"
                      value={form.location}
                      onChange={(value) =>
                        update('location', value)
                      }
                      placeholder="e.g. Ahmedabad, India"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Start date"
                      id="startDate"
                      value={form.startDate}
                      onChange={(value) =>
                        update('startDate', value)
                      }
                      placeholder="e.g. April 2026"
                    />

                    <Field
                      label="End date"
                      id="endDate"
                      value={form.endDate}
                      onChange={(value) =>
                        update('endDate', value)
                      }
                      placeholder="e.g. May 2026 / Present"
                    />
                  </div>

                  <TextAreaField
                    label="Description"
                    id="description"
                    value={form.description}
                    onChange={(value) =>
                      update('description', value)
                    }
                    placeholder="Brief description of your role, responsibilities or achievements..."
                  />

                  <TextAreaField
                    label="Highlights"
                    id="highlights"
                    value={form.highlights}
                    onChange={(value) =>
                      update('highlights', value)
                    }
                    placeholder={
                      'Built responsive React applications\nConnected frontend with REST APIs\nWorked with MongoDB and Express'
                    }
                    hint="Add one highlight per line."
                  />

                  <Field
                    label="Display order"
                    id="order"
                    type="number"
                    value={form.order}
                    onChange={(value) =>
                      update('order', Number(value) || 0)
                    }
                  />

                  <p className="-mt-3 text-xs text-muted-foreground">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#287f70] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236f62] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update entry'
                      : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
