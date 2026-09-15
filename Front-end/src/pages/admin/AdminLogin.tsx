import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { DEVELOPER } from '../../data/portfolio'
import { apiFetch, API_BASE } from '../../lib/api'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 5 * 60 * 1000

const INITIALS = DEVELOPER.name
  .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const getRemainingLockout = (): number => {
  try { return Math.max(0, parseInt(sessionStorage.getItem('adm-lock') ?? '0', 10) - Date.now()) }
  catch { return 0 }
}
const getFailedAttempts = (): number => {
  try { return parseInt(sessionStorage.getItem('adm-fails') ?? '0', 10) } catch { return 0 }
}

// ─── Icons ────────────────────────────────────────────────────
const SunIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const MoonIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const EyeIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const EyeOffIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const AlertIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const Spinner    = () => <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>

interface FieldProps {
  id: string; name: string; type?: string; label: string
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; autoComplete?: string; suffix?: React.ReactNode; disabled?: boolean
}
function FloatingField({ id, name, type = 'text', label, value, onChange, error, autoComplete, suffix, disabled }: FieldProps) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0
  return (
    <div>
      <div className="relative">
        <input id={id} name={name} type={type} autoComplete={autoComplete}
          value={value} onChange={onChange} placeholder="" disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`input-base pt-6 pb-2${error ? ' has-error' : ''}${suffix ? ' pr-11' : ''}${disabled ? ' opacity-50 cursor-not-allowed' : ''}`}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} aria-required="true" />
        <label htmlFor={id} className="pointer-events-none absolute left-[14px]" style={{
          top: lifted ? '7px' : '50%', transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? '10px' : '14px', letterSpacing: lifted ? '0.07em' : '0',
          color: focused ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'all 180ms var(--ease-out)', fontWeight: lifted ? 600 : 400,
        }}>{label}</label>
        {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">{suffix}</div>}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-caption"
          style={{ color: 'var(--error)' }} role="alert"><AlertIcon />{error}</p>
      )}
    </div>
  )
}

export default function AdminLogin() {
  const { theme, toggleTheme } = useTheme()
  const navigate   = useNavigate()
  const emailRef   = useRef<HTMLInputElement>(null)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [errors,      setErrors]      = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const [lockoutMs,   setLockoutMs]   = useState(getRemainingLockout)

  // Check if the server already has a valid session cookie (e.g. after refresh)
  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(r => { if (alive && r.ok) navigate('/admin/dashboard', { replace: true }) })
      .catch(() => {/* no cookie — stay on login */})
      .finally(() => { if (alive) setMounted(true) })
    emailRef.current?.focus()
    return () => { alive = false }
  }, [navigate])

  useEffect(() => {
    if (lockoutMs <= 0) return
    const id = setInterval(() => {
      const rem = getRemainingLockout()
      setLockoutMs(rem)
      if (rem <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [lockoutMs])

  const isLockedOut = lockoutMs > 0

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    else if (password.length > 128) e.password = 'Password is too long.'
    return e
  }

  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)
      setErrors(prev => ({ ...prev, [field]: undefined }))
      setServerError('')
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLockedOut) return
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true); setServerError('')
    try {
      // credentials:'include' is handled by apiFetch.
      // On success the server sets an httpOnly cookie — no token in JS.
      const { ok, data } = await apiFetch<{ success: boolean; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      if (ok && (data as any).success) {
        try { sessionStorage.removeItem('adm-fails'); sessionStorage.removeItem('adm-lock') } catch { /**/ }
        navigate('/admin/dashboard', { replace: true })
      } else {
        try {
          const attempts = getFailedAttempts() + 1
          sessionStorage.setItem('adm-fails', String(attempts))
          if (attempts >= MAX_ATTEMPTS) {
            const until = Date.now() + LOCKOUT_MS
            sessionStorage.setItem('adm-lock', String(until))
            setLockoutMs(LOCKOUT_MS)
          }
        } catch { /**/ }
        setServerError((data as any)?.message || 'Login failed. Please try again.')
      }
    } catch {
      setServerError('Unable to reach the server. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const lockoutSecs = Math.ceil(lockoutMs / 1000)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div aria-hidden="true" className="pointer-events-none fixed top-0 inset-x-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

      <nav className="flex items-center justify-between px-6 sm:px-8 h-[56px] border-b shrink-0"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link to="/" className="flex items-center gap-2.5" aria-label="Back to portfolio">
          <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[10px] font-bold select-none"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg)' }}>{INITIALS}</div>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>← Back to site</span>
        </Link>
        <button onClick={toggleTheme} className="icon-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]" style={{
          opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)',
        }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
              style={{ backgroundColor: 'var(--accent-surface)', color: 'var(--accent)' }}><ShieldIcon /></div>
            <h1 className="text-h2 mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Admin sign in</h1>
            <p className="text-small" style={{ color: 'var(--text-muted)' }}>Manage your portfolio content</p>
          </div>

          {isLockedOut && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3.5 rounded-xl text-small"
              style={{ backgroundColor: 'var(--error-surface)', color: 'var(--error)', border: '1px solid var(--error)' }}
              role="alert" aria-live="assertive">
              <span className="mt-px shrink-0"><AlertIcon /></span>
              <span>Too many failed attempts. Try again in {lockoutSecs}s.</span>
            </div>
          )}

          {serverError && !isLockedOut && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3.5 rounded-xl text-small"
              style={{ backgroundColor: 'var(--error-surface)', color: 'var(--error)', border: '1px solid var(--error)' }}
              role="alert" aria-live="polite">
              <span className="mt-px shrink-0"><AlertIcon /></span>
              <span>{serverError}</span>
            </div>
          )}

          <div className="rounded-2xl border p-7"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FloatingField id="admin-email" name="email" type="email" label="Email address"
                value={email} onChange={handleChange('email')} error={errors.email}
                autoComplete="email" disabled={isLockedOut || loading} />
              <FloatingField id="admin-password" name="password" type={showPass ? 'text' : 'password'}
                label="Password" value={password} onChange={handleChange('password')}
                error={errors.password} autoComplete="current-password" disabled={isLockedOut || loading}
                suffix={
                  <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
                    className="flex items-center justify-center w-7 h-7 rounded-md"
                    style={{ color: 'var(--text-muted)' }} aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                } />
              <button type="submit" disabled={loading || isLockedOut}
                className="w-full flex items-center justify-center gap-2.5 py-3 text-[14px] font-semibold rounded-xl mt-2"
                style={{
                  backgroundColor: 'var(--accent)', color: '#fff',
                  opacity: (loading || isLockedOut) ? 0.6 : 1,
                  cursor: (loading || isLockedOut) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 150ms, opacity 150ms, transform 120ms, box-shadow 150ms',
                  boxShadow: loading ? 'none' : '0 2px 12px rgba(42,122,104,0.35)',
                }}>
                {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-small" style={{ color: 'var(--text-muted)' }}>
            Not for you?{' '}
            <Link to="/" className="font-medium" style={{ color: 'var(--text-secondary)' }}>Return to portfolio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
