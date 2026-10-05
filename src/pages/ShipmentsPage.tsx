import { ShipmentTable } from '../components/shipment/ShipmentTable'
import { SHIPMENTS } from '../lib/shipments'
import { AppScreen } from './AppScreen'

export function ShipmentsPage() {
  return (
    <AppScreen title="Shipments">
      <section className="panel overflow-hidden" aria-label="Shipment list">
        <ShipmentTable rows={SHIPMENTS} filterable />
      </section>
    </AppScreen>
  )
}
