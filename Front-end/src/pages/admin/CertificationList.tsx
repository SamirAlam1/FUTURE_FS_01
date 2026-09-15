import { FormEvent, useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

type Certification = {
  _id?: string
  title: string
  issuer: string
  date: string
  credentialUrl: string
  order: number
}

type ApiResponse<T = unknown> = {
  data?: T
  message?: string
  success?: boolean
}

const EMPTY_FORM: Certification = {
  title: '',
  issuer: '',
  date: '',
  credentialUrl: '',
  order: 0,
}

const inputClass =
  'w-full rounded-2xl border border-border bg-transparent px-5 py-3.5 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10'

const getMessage = (data: unknown, fallback: string) =>
  typeof data === 'object' &&
  data !== null &&
  'message' in data &&
  typeof data.message === 'string'
    ? data.message
    : fallback

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-base font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--accent)' }}> *</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function BadgeCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function CertificationsList() {
  const [items, setItems] = useState<Certification[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCertifications = async () => {
    setLoading(true)
    setError('')

    try {
      const { ok, data } =
        await apiFetch<ApiResponse<Certification[]>>(
          '/certifications',
        )

      if (!ok) {
        throw new Error(
          getMessage(data, 'Failed to load certifications'),
        )
      }

      setItems(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load certifications',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCertifications()
  }, [])

  const update = (
    field: keyof Certification,
    value: string | number,
  ) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const reset = () => {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setError('')
  }

  const closeModal = () => {
    if (saving) return
    setShowModal(false)
    reset()
  }

  const openAdd = () => {
    reset()
    setSuccess('')
    setShowModal(true)
  }

  const openEdit = (item: Certification) => {
    setForm({
      title: item.title ?? '',
      issuer: item.issuer ?? '',
      date: item.date ?? '',
      credentialUrl: item.credentialUrl ?? '',
      order: Number(item.order) || 0,
    })

    setEditingId(item._id ?? null)
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      date: form.date.trim(),
      credentialUrl: form.credentialUrl.trim(),
      order: Number(form.order) || 0,
    }

    if (!payload.title) {
      setError('Certification title is required.')
      return
    }

    if (!payload.issuer) {
      setError('Issuer is required.')
      return
    }

    if (!payload.date) {
      setError('Date is required.')
      return
    }

    if (
      payload.credentialUrl &&
      !/^https?:\/\/\S+$/i.test(payload.credentialUrl)
    ) {
      setError(
        'Credential URL must start with http:// or https://.',
      )
      return
    }

    setSaving(true)

    try {
      const url = editingId
        ? `/admin/certifications/${editingId}`
        : '/admin/certifications'

      const { ok, data } =
        await apiFetch<ApiResponse>(url, {
          method: editingId ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        })

      if (!ok) {
        throw new Error(
          getMessage(data, 'Failed to save certification'),
        )
      }

      setShowModal(false)
      reset()
      setSuccess(
        editingId
          ? 'Certification updated successfully.'
          : 'Certification added successfully.',
      )

      await loadCertifications()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save certification',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Delete this certification? This action cannot be undone.',
      )
    ) {
      return
    }

    setError('')
    setSuccess('')
    setDeletingId(id)

    try {
      const { ok, data } =
        await apiFetch<ApiResponse>(
          `/admin/certifications/${id}`,
          { method: 'DELETE' },
        )

      if (!ok) {
        throw new Error(
          getMessage(data, 'Failed to delete certification'),
        )
      }

      setItems(items => items.filter(item => item._id !== id))
      setSuccess('Certification deleted successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete certification',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p
          className="text-caption mb-2 font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'var(--accent)' }}
        >
          Content Management
        </p>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Certifications
            </h2>

            <p
              className="text-small mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Manage certificates, credentials and
              professional achievements.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                color: '#fff',
                backgroundColor: 'var(--accent)',
              }}
            >
              <PlusIcon />
              Add certification
            </button>

            <span
              className="rounded-lg px-2.5 py-1.5 text-caption"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--surface-elevated)',
              }}
            >
              {items.length}{' '}
              {items.length === 1
                ? 'certificate'
                : 'certificates'}
            </span>
          </div>
        </div>
      </header>

      {error && !showModal && (
        <Alert type="error">{error}</Alert>
      )}

      {success && <Alert type="success">{success}</Alert>}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3
            className="text-[15px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Existing certifications
          </h3>

          <button
            type="button"
            onClick={loadCertifications}
            className="text-caption font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <EmptyState>Loading certifications…</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>
            <p
              className="text-small font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              No certifications yet.
            </p>

            <p
              className="text-caption mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Click “Add certification” to add your
              first certification.
            </p>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <article
                key={item._id ?? `${item.title}-${item.date}`}
                className="rounded-2xl border p-5"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: 'var(--accent-surface)',
                        color: 'var(--accent)',
                      }}
                    >
                      <BadgeCheckIcon />
                    </div>

                    <div className="min-w-0">
                      <h4
                        className="text-[15px] font-semibold"
                        style={{
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.title}
                      </h4>

                      <p
                        className="text-small mt-1"
                        style={{
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {item.issuer}
                      </p>

                      <p
                        className="text-caption mt-1 font-mono"
                        style={{
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.date}
                      </p>

                      {item.credentialUrl && (
                        <a
                          href={item.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-caption font-medium"
                          style={{
                            color: 'var(--accent)',
                          }}
                        >
                          View credential
                          <ExternalLinkIcon />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>

                    {item._id && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item._id!)
                        }
                        disabled={
                          deletingId === item._id
                        }
                        className="rounded-lg border px-3 py-2 text-small font-medium disabled:opacity-50"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--error)',
                        }}
                      >
                        {deletingId === item._id
                          ? 'Deleting…'
                          : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-[#171716] sm:max-h-[calc(100vh-2rem)]"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-7">
              <div>
                <h3
                  className="text-xl font-semibold tracking-tight"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  {editingId
                    ? 'Edit certification'
                    : 'Add certification'}
                </h3>

                <p
                  className="mt-1 text-small"
                  style={{
                    color: 'var(--text-muted)',
                  }}
                >
                  {editingId
                    ? 'Update the selected certification.'
                    : 'Add a new certification to your portfolio.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-1 text-2xl leading-none transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{
                  color: 'var(--text-muted)',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">
                {error && <Alert type="error">{error}</Alert>}

                <div className="space-y-6">
                  <Field
                    label="Certification title"
                    required
                    value={form.title}
                    onChange={value =>
                      update('title', value)
                    }
                    placeholder="e.g. AWS Cloud Practitioner"
                  />

                  <Field
                    label="Issuer"
                    required
                    value={form.issuer}
                    onChange={value =>
                      update('issuer', value)
                    }
                    placeholder="e.g. Amazon Web Services"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Date"
                      required
                      value={form.date}
                      onChange={value =>
                        update('date', value)
                      }
                      placeholder="e.g. August 2026"
                    />

                    <Field
                      label="Display order"
                      type="number"
                      value={String(form.order)}
                      onChange={value =>
                        update(
                          'order',
                          Number(value) || 0,
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <Field
                    label="Credential URL"
                    type="url"
                    value={form.credentialUrl}
                    onChange={value =>
                      update(
                        'credentialUrl',
                        value,
                      )
                    }
                    placeholder="https://example.com/credential"
                  />
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/[0.03] disabled:opacity-50 dark:hover:bg-white/[0.04]"
                  style={{
                    color: 'var(--text-primary)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    color: '#fff',
                    backgroundColor: 'var(--accent)',
                  }}
                >
                  {saving
                    ? 'Saving…'
                    : editingId
                      ? 'Update certification'
                      : 'Add certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Alert({
  children,
  type,
}: {
  children: string
  type: 'error' | 'success'
}) {
  return (
    <div
      className="mb-5 rounded-lg border px-4 py-3 text-small"
      style={{
        color:
          type === 'error'
            ? 'var(--error)'
            : 'var(--success)',
        backgroundColor:
          type === 'error'
            ? 'var(--error-surface)'
            : 'var(--surface-elevated)',
        borderColor: 'var(--border)',
      }}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

function EmptyState({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
      }}
    >
      {children}
    </div>
  )
}