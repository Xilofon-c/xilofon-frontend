import { ShipmentTable } from '../components/shipment/ShipmentTable'
import { SHIPMENTS } from '../lib/shipments'
import { AppScreen } from './AppScreen'

export function ShipmentsPage() {
  return (
    <AppScreen
      kicker="History"
      title="Shipments"
      description="All drafts, loads in progress, and completed loads. Open a shipment to see its 3D load plan."
    >
      <section className="panel overflow-hidden" aria-label="Shipment list">
        <ShipmentTable rows={SHIPMENTS} filterable />
      </section>
    </AppScreen>
  )
}
