import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

function CheckIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>)
}
function XIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>)
}
function TrashIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>)
}
function MailIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>)
}

type Message = {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}

type Filter = 'all' | 'unread' | 'read'

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState(false)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await apiFetch('/admin/messages')
      if (!res.ok) throw new Error(`${res.status}`)
      const list = Array.isArray(res.data) ? res.data as Message[] : ((res.data as Record<string,unknown>)?.data as Message[] ?? [])
      setMessages(list)
    } catch {
      setError('Unable to load messages. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read
    if (filter === 'read') return m.read
    return true
  })

  const selected = messages.find(m => m._id === selectedId) ?? null
  const unreadCount = messages.filter(m => !m.read).length

  const markRead = async (id: string) => {
    setActionPending(true)
    try {
      const res = await apiFetch(`/admin/messages/${id}/read`, { method: 'PATCH' })
      if (res.ok) {
        setMessages(ms => ms.map(m => m._id === id ? { ...m, read: true } : m))
      }
    } finally {
      setActionPending(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActionPending(true)
    try {
      const res = await apiFetch(`/admin/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(ms => ms.filter(m => m._id !== id))
        if (selectedId === id) setSelectedId(null)
      }
    } finally {
      setDeleteId(null)
      setActionPending(false)
    }
  }

  const openMessage = (msg: Message) => {
    setSelectedId(msg._id)
    if (!msg.read) markRead(msg._id)
  }

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return iso }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[14px] mb-4" style={{ color: 'var(--error)' }}>{error}</p>
        <button onClick={fetchMessages} className="btn-primary" style={{ fontSize: '13px' }}>Retry</button>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {messages.length} total
            {unreadCount > 0 && (
              <span className="ml-2 font-semibold" style={{ color: 'var(--accent)' }}>
                · {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchMessages} className="text-[13px] px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--surface)' }}>
        {([['all', 'All'], ['unread', 'Unread'], ['read', 'Read']] as [Filter, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-150"
            style={{
              backgroundColor: filter === val ? 'var(--bg)' : 'transparent',
              color: filter === val ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {label}
            {val === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border" style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}>
          <div className="mb-3 opacity-40" style={{ color: 'var(--text-muted)' }}><MailIcon /></div>
          <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
            No {filter !== 'all' ? filter : ''} messages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map(msg => (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className="w-full text-left px-4 py-4 transition-colors duration-150"
                  style={{
                    backgroundColor: selectedId === msg._id ? 'var(--accent-surface)' : 'var(--surface)',
                    borderLeft: selectedId === msg._id ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (selectedId !== msg._id) e.currentTarget.style.backgroundColor = 'var(--surface-elevated)' }}
                  onMouseLeave={e => { if (selectedId !== msg._id) e.currentTarget.style.backgroundColor = 'var(--surface)' }}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: msg.read ? 'transparent' : 'var(--accent)' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[13px] truncate" style={{ color: 'var(--text-primary)', fontWeight: msg.read ? '500' : '700' }}>
                          {msg.name}
                        </p>
                        <p className="text-[11px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDate(msg.createdAt)}</p>
                      </div>
                      <p className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>{msg.subject}</p>
                      <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{msg.message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.subject}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        From: <span style={{ color: 'var(--text-secondary)' }}>{selected.name}</span> · {selected.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => markRead(selected._id)}
                        disabled={actionPending || selected.read}
                        className="w-8 h-8 flex items-center justify-center rounded border transition-colors duration-150"
                        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', opacity: selected.read ? 0.4 : 1 }}
                        title="Mark as read"
                      >
                        <CheckIcon />
                      </button>
                      <button
                        onClick={() => setDeleteId(selected._id)}
                        className="w-8 h-8 flex items-center justify-center rounded border transition-colors duration-150"
                        style={{ color: 'var(--error)', borderColor: 'var(--border)' }}
                        title="Delete message"
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--error)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] font-mono mt-2" style={{ color: 'var(--text-muted)' }}>Received: {formatDate(selected.createdAt)}</p>
                </div>
                <div className="px-5 py-5">
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {selected.message}
                  </p>
                </div>
                <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                  >
                    Reply via email ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] rounded-xl border flex items-center justify-center"
                style={{ borderColor: 'var(--border)', borderStyle: 'dashed', backgroundColor: 'var(--surface)' }}>
                <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[340px] rounded-xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete message?</h3>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>This message will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-[13px] font-medium rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={actionPending} className="flex-1 py-2 text-[13px] font-semibold rounded-lg" style={{ backgroundColor: 'var(--error)', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
