export type UserRole = 'office' | 'loader'

export type Session = {
  name: string
  email: string
  role: UserRole
}

const KEY = 'session'

export const ROLE_LABEL: Record<UserRole, string> = {
  office: 'Office',
  loader: 'Loading',
}

const FALLBACK: Session = { name: 'Operations user', email: 'ops@smartcargo.io', role: 'office' }

/** Mock session until the auth endpoint exists. */
export function readSession(): Session {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...FALLBACK, ...(JSON.parse(raw) as Partial<Session>) } : FALLBACK
  } catch {
    return FALLBACK
  }
}

export function writeSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
    localStorage.setItem('authToken', 'mock-test-jwt-token')
  } catch {
    // Storage can be unavailable in private windows; the app still works with the fallback.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem('authToken')
  } catch {
    // See writeSession.
  }
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : (parts[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}
