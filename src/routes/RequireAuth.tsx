import { Navigate, Outlet } from 'react-router-dom'
import { isSignedIn } from '../lib/session'

/** App screens need a token. Sign-in and password reset stay outside this layout. */
export default function RequireAuth() {
  if (!isSignedIn()) return <Navigate to="/login" replace />
  return <Outlet />
}
