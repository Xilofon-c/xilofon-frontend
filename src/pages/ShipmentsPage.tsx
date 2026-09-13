import { AppScreen } from './AppScreen'
import { Link } from 'react-router-dom'

export function ShipmentsPage() {
  return (
    <AppScreen kicker="History" title="Shipments">
      <p className="section-copy">
        Delivery history for completed and in-progress loads. Scan a BOL to attach a new shipment.
      </p>
      <div className="panel" style={{ marginTop: 24, padding: 28 }}>
        <p className="section-copy" style={{ margin: 0 }}>
          No deliveries yet. Completed loads will appear here after a bill of lading is scanned and
          staged.
        </p>
        <Link to="/shipments/new" className="btn btn-primary" style={{ marginTop: 20 }}>
          Create shipment
        </Link>
      </div>
    </AppScreen>
  )
}
