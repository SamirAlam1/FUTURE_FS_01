/**
 * Centralised API client.
 * Authentication uses an httpOnly cookie set by the backend.
 * Production API requests use Vercel's same-origin /api proxy.
 */

export const API_BASE = '/api'

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

  if (res.status === 401 && window.location.pathname.startsWith('/admin')) {
    window.location.replace('/admin/login')
    return { ok: false, status: 401, data: null as T }
  }

  const data: T = await res.json().catch(() => null as T)

  return { ok: res.ok, status: res.status, data }
}