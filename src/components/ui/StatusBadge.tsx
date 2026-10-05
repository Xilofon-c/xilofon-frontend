import type { ShipmentStatus } from '../../lib/shipments'

const TONE: Record<ShipmentStatus, string> = {
  Completed: 'badge-ok',
  Loading: 'badge-warn',
  Draft: 'badge-neutral',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return <span className={`badge ${TONE[status]}`}>{status}</span>
}
