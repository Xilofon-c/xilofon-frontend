import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isSignedIn, readRole } from '../lib/session'

type OfficeRouteProps = {
  children: ReactNode
}

export default function OfficeRoute({ children }: OfficeRouteProps) {
  // A signed-in loader is sent to their account. Office users see the planner.
  if (isSignedIn() && readRole() !== 'office') {
    return <Navigate to="/account" replace />
  }
  return children
}
