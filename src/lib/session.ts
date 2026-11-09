export type UserRole = 'office' | 'loader'

export type Session = {
  name: string
  email: string
  role: UserRole
}

const KEY = 'session'
const ROLE = 'userRole'
const TOKEN = 'authToken'

export const ROLE_LABEL: Record<UserRole, string> = {
  office: 'Office',
  loader: 'Loader',
}

const FALLBACK: Session = { name: 'Operations user', email: 'ops@smartcargo.io', role: 'office' }

/** Profile cached at login; the Account page refreshes it from /data/me. */
export function readSession(): Session {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...FALLBACK, ...(JSON.parse(raw) as Partial<Session>) } : FALLBACK
  } catch {
    return FALLBACK
  }
}

export function readRole(): UserRole | null {
  try {
    const role = localStorage.getItem(ROLE)
    return role === 'office' || role === 'loader' ? role : null
  } catch {
    return null
  }
}

type JwtPayload = { exp?: unknown }

function tokenExpiry(token: string) {
  const segment = token.split('.')[1]
  if (!segment) return null
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded)) as JwtPayload
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function storedToken() {
  try {
    const token = localStorage.getItem(TOKEN)
    if (!token) return null
    const expiry = tokenExpiry(token)
    // A token with no readable expiry cannot be trusted; treat it as already finished.
    const remainingMs = expiry === null ? 0 : expiry - Date.now()
    return { token, remainingMs }
  } catch {
    return null
  }
}

/** Time left on the stored token. Null when nothing is stored. Zero when it cannot be read or is past `exp`. */
export function sessionRemainingMs() {
  const stored = storedToken()
  return stored ? stored.remainingMs : null
}

/** Bearer token for API calls. Null when it is missing or no longer valid. */
export function readAuthToken() {
  const stored = storedToken()
  if (!stored || stored.remainingMs <= 0) return null
  return stored.token
}

export function isSignedIn() {
  return readAuthToken() !== null
}

/** Keeps the current token unless the login response gives a new one. */
export function writeSession(session: Session, token?: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
    localStorage.setItem(ROLE, session.role)
    if (token) localStorage.setItem(TOKEN, token)
  } catch {
    // Storage can be unavailable in private windows; the app still works with the fallback.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(ROLE)
    localStorage.removeItem(TOKEN)
  } catch {
    // See writeSession.
  }
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : (parts[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}
