import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isSignedIn, readRole } from '../lib/session'

type OfficeRouteProps = {
  children: ReactNode
}

export default function OfficeRoute({ children }: OfficeRouteProps) {
  // Guests can open the planner. A signed-in loader is sent to their account.
  if (isSignedIn() && readRole() !== 'office') {
    return <Navigate to="/account" replace />
  }
  return children
}
