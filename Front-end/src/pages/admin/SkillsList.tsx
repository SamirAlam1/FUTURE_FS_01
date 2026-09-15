import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { SKILL_CATEGORIES } from '../../data/portfolio'


type Skill = { _id: string; name: string; category: string; proficiency: number; order?: number }
type SkillForm = { name: string; category: string; proficiency: number }

function PlusIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>)
}
function EditIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>)
}
function TrashIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>)
}
function XIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>)
}

const emptyForm: SkillForm = { name: '', category: SKILL_CATEGORIES[0], proficiency: 75 }


function profLabel(p: number) {
  if (p >= 85) return 'Expert'
  if (p >= 70) return 'Proficient'
  if (p >= 55) return 'Intermediate'
  return 'Learning'
}

function profColor(p: number) {
  if (p >= 85) return { color: 'var(--success)', bg: 'var(--success-surface)' }
  if (p >= 70) return { color: 'var(--accent)', bg: 'var(--accent-surface)' }
  if (p >= 55) return { color: 'var(--warning)', bg: 'var(--warning-surface)' }
  return { color: 'var(--text-muted)', bg: 'var(--surface-elevated)' }
}

export default function SkillsList() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SkillForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('All')

  const fetchSkills = async () => {
    try {
      setLoading(true)
      setError('')
      const { ok, data: result } = await apiFetch<{ data?: unknown[] }>('/skills')
      if (!ok) throw new Error('Failed to load skills')
      setSkills(Array.isArray(result?.data) ? result.data as Skill[] : [])
    } catch (err) {
      setError('Failed to load skills. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSkills() }, [])

  const filtered = filterCat === 'All' ? skills : skills.filter(s => s.category === filterCat)

  const grouped = SKILL_CATEGORIES.map(cat => ({
    cat,
    skills: filtered.filter(s => s.category === cat),
  })).filter(g => g.skills.length > 0)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (s: Skill) => {
    setForm({ name: s.name, category: s.category, proficiency: s.proficiency })
    setEditingId(s._id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const url = editingId
        ? `/admin/skills/${editingId}`
        : `/admin/skills`
      const { ok: saveOk, data: result } = await apiFetch<{ data?: Skill }>(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      if (!saveOk) throw new Error('Save failed')
      if (editingId) {
        setSkills(ss => ss.map(s => s._id === editingId ? (result?.data ?? s) : s))
        setSavedId(editingId)
      } else {
        const newSkill = result?.data
        if (newSkill) {
          setSkills(ss => [...ss, newSkill])
          setSavedId(newSkill._id)
        }
      }
      setShowForm(false)
      setTimeout(() => setSavedId(null), 2000)
    } catch {
      setError('Failed to save skill. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const r = await apiFetch(`/admin/skills/${id}`, {
        method: 'DELETE',
      })
      if (!r.ok) throw new Error('Delete failed')
      setSkills(ss => ss.filter(s => s._id !== id))
      setDeleteId(null)
    } catch {
      setError('Failed to delete skill. Please try again.')
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-[900px] space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Skills</h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{skills.length} skills across {SKILL_CATEGORIES.length} categories</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          <PlusIcon /> Add skill
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-[13px]" style={{ backgroundColor: 'var(--error-surface)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {savedId && (
        <div className="px-4 py-3 rounded-lg text-[13px]" style={{ backgroundColor: 'var(--success-surface)', color: 'var(--success)' }}>
          Skill saved successfully.
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...SKILL_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-all duration-150"
            style={{
              borderColor: filterCat === cat ? 'var(--accent)' : 'var(--border)',
              backgroundColor: filterCat === cat ? 'var(--accent-surface)' : 'var(--surface)',
              color: filterCat === cat ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[13px]" style={{ color: 'var(--text-muted)' }}>
          <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading skills…
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cat, skills: catSkills }) => (
            <div key={cat} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{cat}</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {catSkills.map(skill => {
                  const { color, bg } = profColor(skill.proficiency)
                  return (
                    <div
                      key={skill._id}
                      className="flex items-center justify-between gap-4 px-5 py-3"
                      style={{ backgroundColor: savedId === skill._id ? 'var(--accent-surface)' : 'var(--surface)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</p>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ color, backgroundColor: bg }}>
                          {profLabel(skill.proficiency)} · {skill.proficiency}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEdit(skill)}
                          className="w-7 h-7 flex items-center justify-center rounded border transition-colors duration-150"
                          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                          aria-label="Edit skill"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeleteId(skill._id)}
                          className="w-7 h-7 flex items-center justify-center rounded border transition-colors duration-150"
                          style={{ color: 'var(--error)', borderColor: 'var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--error)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          aria-label="Delete skill"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed px-5 py-10 text-center text-[13px]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              No skills yet. Add your first skill above.
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[420px] rounded-xl border shadow-xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit skill' : 'New skill'}</h3>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><XIcon /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Skill name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. TypeScript" className="input-base" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-base">
                  {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Proficiency: {form.proficiency}%
                </label>
                <input
                  type="range" min={20} max={100} value={form.proficiency}
                  onChange={e => setForm(f => ({ ...f, proficiency: Number(e.target.value) }))}
                  className="w-full" style={{ accentColor: 'var(--accent)' }}
                />
                <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Learning</span><span>Intermediate</span><span>Proficient</span><span>Expert</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[13px] font-medium rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-[13px] font-semibold rounded-lg"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', opacity: saving ? 0.7 : 1 }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--accent-hover)' }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[340px] rounded-xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete skill?</h3>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>"{skills.find(s => s._id === deleteId)?.name}" will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-[13px] font-medium rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 text-[13px] font-semibold rounded-lg" style={{ backgroundColor: 'var(--error)', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
