import { CircleUser, ClipboardList, LayoutDashboard, Package } from 'lucide-react'

export const DESKTOP_NAV_QUERY = '(min-width: 720px)'

export const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shipments', label: 'Shipments', icon: Package },
  { to: '/report', label: 'Report', icon: ClipboardList },
  { to: '/account', label: 'Account', icon: CircleUser },
] as const

/** `end` keeps "Shipments" inactive on /shipments/new, which has its own button. */
export function isExactRoute(to: string) {
  return to === '/' || to === '/shipments'
}
