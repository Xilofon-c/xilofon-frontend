import { ClipboardList, House, Package, Plus } from 'lucide-react'

export const DESKTOP_NAV_QUERY = '(min-width: 720px)'

export const NAV_LINKS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/shipments', label: 'Shipments', icon: Package },
  { to: '/report', label: 'Report', icon: ClipboardList },
] as const

/** The mobile bar has two slots on each side of the scan button; "New" fills the fourth. */
export const MOBILE_EXTRA_LINK = { to: '/shipments/new', label: 'New', icon: Plus } as const

/** `end` keeps "Shipments" inactive on /shipments/new, which has its own button. */
export function isExactRoute(to: string) {
  return to === '/' || to === '/shipments'
}
