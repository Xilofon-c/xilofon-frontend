import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearSession, isSignedIn, sessionRemainingMs } from '../lib/session'

/** setTimeout delay is a 32-bit signed integer. */
const MAX_DELAY = 2_147_483_647

/** App screens need a token that has not expired. Sign-in and password reset stay outside this layout. */
export default function RequireAuth() {
  const { key } = useLocation()
  const [tick, setTick] = useState(0)
  const signedIn = isSignedIn()

  useEffect(() => {
    if (!signedIn) {
      clearSession()
      return
    }
    const remaining = sessionRemainingMs()
    if (remaining === null || remaining <= 0) return
    const id = window.setTimeout(() => setTick((value) => value + 1), Math.min(remaining, MAX_DELAY))
    return () => window.clearTimeout(id)
  }, [key, signedIn, tick])

  if (!signedIn) return <Navigate to="/login" replace />
  return <Outlet />
}
