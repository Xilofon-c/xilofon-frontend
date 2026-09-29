import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { SHIPMENT_STATUSES, type Shipment, type ShipmentStatus } from '../../lib/shipments'
import { StatusBadge } from '../ui/StatusBadge'
import { UsageMeter } from '../ui/UsageMeter'

type ShipmentTableProps = {
  rows: Shipment[]
  /** Shows the search field and status filter above the table. */
  filterable?: boolean
}

export function ShipmentTable({ rows, filterable = false }: ShipmentTableProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ShipmentStatus | 'All'>('All')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (status !== 'All' && row.status !== status) return false
      if (!term) return true
      return [row.id, row.vehicle, row.destination].some((value) => value.toLowerCase().includes(term))
    })
  }, [rows, query, status])

  return (
    <>
      {filterable ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <span className="visually-hidden">Search shipments</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              type="search"
              className="field-input min-h-9 pl-9"
              placeholder="Search ID, vehicle, or destination"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="segmented" role="group" aria-label="Filter by status">
            {(['All', ...SHIPMENT_STATUSES] as const).map((option) => (
              <button key={option} type="button" aria-pressed={status === option} onClick={() => setStatus(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Shipment</th>
              <th scope="col">Vehicle</th>
              <th scope="col">Destination</th>
              <th scope="col" className="num">Boxes</th>
              <th scope="col" className="num">Volume</th>
              <th scope="col" className="num">Payload</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="font-semibold text-ink tabular-nums">{row.id}</td>
                <td>{row.vehicle}</td>
                <td>
                  {row.destination}
                  {row.stops > 1 ? <span className="text-ink-faint"> · {row.stops} stops</span> : null}
                </td>
                <td className="num">{row.boxes}</td>
                <td className="num">
                  <UsageMeter value={row.volume} label="Volume used" />
                </td>
                <td className="num">
                  <UsageMeter value={row.weight} label="Payload used" />
                </td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="text-ink-muted tabular-nums">{row.date}</td>
                <td className="text-right">
                  <Link to="/shipments/new" className="btn btn-ghost btn-sm" aria-label={`Open 3D plan for ${row.id}`}>
                    View 3D
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <strong>No shipments match</strong>
          Change the search text or the status filter.
        </div>
      ) : null}
    </>
  )
}
