import axios, { isAxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // Storage can be unavailable in private windows; the request goes without a token.
  }
  return config
})

/** Reads the FastAPI `detail` field, which is a string or a list of validation errors. */
export function apiError(error: unknown, fallback = 'Something went wrong. Try again.') {
  if (!isAxiosError(error)) return error instanceof Error ? error.message : fallback
  if (!error.response) return 'The server is unreachable. Confirm the backend is running.'
  const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string }
    return first.msg ?? fallback
  }
  return fallback
}
