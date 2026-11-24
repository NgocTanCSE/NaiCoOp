import { supabase, supabaseEnabled } from './supabase'

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '')

/** Chế độ API: chỉ bật khi có VITE_API_URL. Nếu tắt, prototype dùng dữ liệu seed (offline). */
export const apiEnabled = Boolean(API_URL)

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!supabaseEnabled) return {}
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!API_URL) throw new ApiError(503, 'api_disabled', 'Chưa cấu hình VITE_API_URL')
  const headers: Record<string, string> = { ...(await authHeaders()) }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  if (!res.ok) {
    const title = (json.title as string) || `Lỗi ${res.status}`
    const code = (json.code as string) || 'error'
    throw new ApiError(res.status, code, title, json.details)
  }
  return json as T
}

export const apiGet = <T>(path: string) => request<T>('GET', path)
export const apiPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body)
export const apiPatch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body)
export const apiDelete = <T>(path: string) => request<T>('DELETE', path)
