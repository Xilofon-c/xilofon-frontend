import axios, { isAxiosError } from 'axios'
import { clearSession, readAuthToken, sessionRemainingMs } from './session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

const PUBLIC_PATHS = new Set(['/login', '/forgot-password', '/input-pin', '/reset-password'])

/** Login and signup answer 401 for bad credentials. That is not an expired session. */
const CREDENTIAL_PATH = /\/data\/(?:login|signup)\/?$/

function redirectToLogin() {
  if (PUBLIC_PATHS.has(window.location.pathname)) return
  window.location.replace('/login')
}

api.interceptors.request.use((config) => {
  try {
    const remaining = sessionRemainingMs()
    if (remaining !== null && remaining <= 0) {
      clearSession()
      redirectToLogin()
    }
    const token = readAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // Storage can be unavailable in private windows; the request goes without a token.
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = isAxiosError(error) ? (error.config?.url ?? '') : ''
    if (isAxiosError(error) && error.response?.status === 401 && !CREDENTIAL_PATH.test(url)) {
      clearSession()
      redirectToLogin()
    }
    return Promise.reject(error)
  },
)

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
