/**
 * Centralised API client — credentials:include on every request.
 *
 * The JWT now lives exclusively in an httpOnly, SameSite=None, Secure cookie
 * set by the backend. JS can never read it (eliminates H-1 XSS token theft).
 *
 * credentials:'include' is required on every fetch so the browser sends the
 * cross-origin cookie (Vercel → Render) on every request.
 * There are no more Authorization headers or localStorage reads.
 */

export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

type Options = Omit<RequestInit, 'credentials'>

export async function apiFetch<T = unknown>(
  path: string,
  options: Options = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const isWrite = !!options.method && options.method !== 'GET'

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isWrite ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  // Auto-redirect to login on 401 while inside the admin panel
  if (res.status === 401 && window.location.pathname.startsWith('/admin')) {
    window.location.replace('/admin/login')
    return { ok: false, status: 401, data: null as T }
  }

  const data: T = await res.json().catch(() => null as T)
  return { ok: res.ok, status: res.status, data }
}
