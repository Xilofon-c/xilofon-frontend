import { LoaderCircle } from 'lucide-react'
import { ShipmentTable } from '../components/shipment/ShipmentTable'
import { useShipmentList } from '../hooks/useShipmentList'

export function ShipmentsPage() {
  const { rows, error } = useShipmentList()

  return (
    <div className="page">
      <main id="main" className="w-full">
        <h1 className="sr-only">Shipments</h1>
        {error ? (
          <p className="alert alert-danger m-4" role="alert">
            {error}
          </p>
        ) : rows === null ? (
          <p className="empty-state flex items-center justify-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading shipments…
          </p>
        ) : (
          <ShipmentTable rows={rows} filterable />
        )}
      </main>
    </div>
  )
}
