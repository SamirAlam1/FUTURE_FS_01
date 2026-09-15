import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { Education } from '../../data/portfolio'


type EducationEntry = Education & {
  board: string
}

type EducationForm = {
  institution: string
  degree: string
  field: string
  board: string
  startYear: string
  endYear: string
  grade: string
  description: string
}

const BOARD_OPTIONS = [
  'CBSE',
  'BSEB',
  'ICSE',
  'GSEB',
  'GTU',
  'Gujarat University',
  'P P Savani University',
]

const EMPTY_FORM: EducationForm = {
  institution: '',
  degree: '',
  field: '',
  board: '',
  startYear: '',
  endYear: '',
  grade: '',
  description: '',
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

async function parseResponse(response: { ok: boolean; status: number; data: unknown }) {
  const data = (response.data ?? {}) as Record<string, unknown>
  if (!response.ok) {
    throw new Error((data.message as string) || 'Something went wrong')
  }
  return data
}
export default function EducationList() {
  const [entries, setEntries] = useState<EducationEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EducationForm>(EMPTY_FORM)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [customBoard, setCustomBoard] = useState(false)

  const loadEducation = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiFetch('/education')
      const result = await parseResponse(response)

      const data = Array.isArray(result.data) ? result.data : []

      setEntries(
        data.map((item: any) => ({
          id: item._id ?? item.id,
          institution: item.institution ?? '',
          degree: item.degree ?? '',
          field: item.field ?? '',
          board: item.board ?? '',
          startYear: item.startYear ?? '',
          endYear: item.endYear ?? '',
          grade: item.grade ?? '',
          description: item.description ?? '',
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load education')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEducation()
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCustomBoard(false)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEdit = (education: EducationEntry) => {
    setEditingId(education.id)

    const isPresetBoard =
      !education.board || BOARD_OPTIONS.includes(education.board)

    setCustomBoard(!isPresetBoard)

    setForm({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      board: education.board,
      startYear: education.startYear,
      endYear: education.endYear,
      grade: education.grade ?? '',
      description: education.description ?? '',
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const updateField = (
    key: keyof EducationForm,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }))
  }

  const validateForm = () => {
    if (!form.institution.trim()) {
      return 'Institution is required.'
    }

    if (!form.degree.trim()) {
      return 'Degree is required.'
    }

    if (!form.field.trim()) {
      return 'Field of study is required.'
    }

    if (!/^\d{4}$/.test(form.startYear)) {
      return 'Start year must be a 4-digit year.'
    }

    if (!/^\d{4}$/.test(form.endYear)) {
      return 'End year must be a 4-digit year.'
    }

    if (Number(form.endYear) < Number(form.startYear)) {
      return 'End year cannot be before start year.'
    }

    return ''
  }

  const handleSave = async () => {
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        field: form.field.trim(),
        board: form.board.trim(),
        startYear: form.startYear.trim(),
        endYear: form.endYear.trim(),
        grade: form.grade.trim(),
        description: form.description.trim(),
      }

      const url = editingId
        ? `/admin/education/${editingId}`
        : `/admin/education`

      const method = editingId ? 'PUT' : 'POST'

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      })

      const result = await parseResponse(response)

      const saved = result.data as Record<string, unknown>

      const normalized: EducationEntry = {
        id: (saved._id ?? saved.id) as string,
        institution: (saved.institution ?? '') as string,
        degree: (saved.degree ?? '') as string,
        field: (saved.field ?? '') as string,
        board: (saved.board ?? '') as string,
        startYear: (saved.startYear ?? '') as string,
        endYear: (saved.endYear ?? '') as string,
        grade: (saved.grade ?? '') as string,
        description: (saved.description ?? '') as string,
      }

      setEntries(current => {
        if (editingId) {
          return current.map(item =>
            item.id === editingId ? normalized : item,
          )
        }

        return [normalized, ...current]
      })

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setCustomBoard(false)

      setSuccess(
        editingId
          ? 'Education entry updated successfully.'
          : 'Education entry added successfully.',
      )

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save education entry.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      setError('')

      const response = await apiFetch(
        `/admin/education/${deleteId}`,
        { method: 'DELETE' },
      )

      await parseResponse(response)

      setEntries(current =>
        current.filter(item => item.id !== deleteId),
      )

      setDeleteId(null)
      setSuccess('Education entry deleted successfully.')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete education entry.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const field = (
    key: keyof EducationForm,
    label: string,
    placeholder = '',
    textarea = false,
  ) => (
    <div>
      <label
        className="block text-[12px] font-semibold mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          value={form[key]}
          onChange={event =>
            updateField(key, event.target.value)
          }
          placeholder={placeholder}
          rows={4}
          className="input-base"
          style={{ resize: 'vertical' }}
        />
      ) : (
        <input
          value={form[key]}
          onChange={event =>
            updateField(key, event.target.value)
          }
          placeholder={placeholder}
          className="input-base"
        />
      )}
    </div>
  )

  return (
    <div className="max-w-[900px] space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-[20px] font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Education
          </h2>

          <p
            className="text-[13px] mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          <PlusIcon />
          Add entry
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-[13px]"
          style={{
            backgroundColor: 'var(--error-surface)',
            color: 'var(--error)',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          className="px-4 py-3 rounded-lg text-[13px]"
          style={{
            backgroundColor: 'var(--success-surface)',
            color: 'var(--success)',
          }}
        >
          {success}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          className="rounded-xl border py-16 flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <Spinner />
          <span
            className="text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading education…
          </span>
        </div>
      ) : (
        <div className="space-y-4">

          {entries.map(edu => (
            <div
              key={edu.id}
              className="rounded-xl border p-5"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {edu.degree}
                  </p>

                  <p
                    className="text-[14px] mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {edu.field}
                  </p>

                  <p
                    className="text-[13px] mt-1 font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    {edu.institution}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2">

                    <span
                      className="text-[12px] font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {edu.startYear} – {edu.endYear}
                    </span>

                    {edu.board && (
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
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
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--surface-elevated)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {edu.grade}
                      </span>
                    )}

                  </div>

                  {edu.description && (
                    <p
                      className="text-[13px] mt-3 leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {edu.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">

                  <button
                    onClick={() => openEdit(edu)}
                    className="w-8 h-8 flex items-center justify-center rounded border"
                    style={{
                      color: 'var(--text-muted)',
                      borderColor: 'var(--border)',
                    }}
                    aria-label={`Edit ${edu.degree}`}
                  >
                    <EditIcon />
                  </button>

                  <button
                    onClick={() => setDeleteId(edu.id)}
                    className="w-8 h-8 flex items-center justify-center rounded border"
                    style={{
                      color: 'var(--error)',
                      borderColor: 'var(--border)',
                    }}
                    aria-label={`Delete ${edu.degree}`}
                  >
                    <TrashIcon />
                  </button>

                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div
              className="rounded-xl border py-16 text-center"
              style={{
                borderColor: 'var(--border)',
                borderStyle: 'dashed',
              }}
            >
              <p
                className="text-[14px]"
                style={{ color: 'var(--text-muted)' }}
              >
                No education entries yet.
              </p>

              <button
                onClick={openNew}
                className="mt-3 text-[13px] font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Add your first entry →
              </button>
            </div>
          )}

        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >

            <div
              className="sticky top-0 flex items-center justify-between px-6 py-4 border-b"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <h3
                className="text-[16px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {editingId
                  ? 'Edit education entry'
                  : 'New education entry'}
              </h3>

              <button
                onClick={() => setShowForm(false)}
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {field(
                'institution',
                'Institution *',
                'e.g. P P Savani University',
              )}

              {field(
                'degree',
                'Degree *',
                'e.g. Bachelor of Technology',
              )}

              {field(
                'field',
                'Field of study *',
                'e.g. Computer Science & Engineering',
              )}

              {/* Board */}
              <div>
                <label
                  className="block text-[12px] font-semibold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Board / University
                </label>

                <select
                  value={
                    customBoard
                      ? '__custom__'
                      : form.board
                  }
                  onChange={event => {
                    const value = event.target.value

                    if (value === '__custom__') {
                      setCustomBoard(true)
                      updateField('board', '')
                    } else {
                      setCustomBoard(false)
                      updateField('board', value)
                    }
                  }}
                  className="input-base"
                >
                  <option value="">Select board / university</option>

                  {BOARD_OPTIONS.map(board => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}

                  <option value="__custom__">
                    Other
                  </option>
                </select>

                {customBoard && (
                  <input
                    value={form.board}
                    onChange={event =>
                      updateField('board', event.target.value)
                    }
                    placeholder="Enter board / university"
                    className="input-base mt-2"
                    autoFocus
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {field(
                  'startYear',
                  'Start year *',
                  '2022',
                )}

                {field(
                  'endYear',
                  'End year *',
                  '2026',
                )}
              </div>

              {field(
                'grade',
                'Grade / CGPA',
                'e.g. 8.5 / 10 or First Class',
              )}

              {field(
                'description',
                'Description',
                'Brief description of coursework, projects or achievements…',
                true,
              )}

            </div>

            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
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
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {saving && <Spinner />}

                {saving
                  ? 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Add entry'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete modal */}
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
              Delete education?
            </h3>

            <p
              className="text-[13px] mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              "
              {entries.find(
                entry => entry.id === deleteId,
              )?.degree}
              " will be permanently removed.
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2 text-[13px] font-medium rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--error)',
                  color: '#fff',
                }}
              >
                {deleting && <Spinner />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}