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

export function isSignedIn() {
  try {
    return Boolean(localStorage.getItem(TOKEN))
  } catch {
    return false
  }
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
