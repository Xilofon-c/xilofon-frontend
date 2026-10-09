import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { formatShipmentDate, formatTruckSize, type ShipmentRow } from '../../lib/shipments'
import { UsageMeter } from '../ui/UsageMeter'

type PlacementFilter = 'All' | 'Placed' | 'Unplaced'

type ShipmentTableProps = {
  rows: ShipmentRow[]
  /** Shows the search field and placement filter above the table. */
  filterable?: boolean
}

const FILTERS: PlacementFilter[] = ['All', 'Placed', 'Unplaced']

export function ShipmentTable({ rows, filterable = false }: ShipmentTableProps) {
  const [query, setQuery] = useState('')
  const [placement, setPlacement] = useState<PlacementFilter>('All')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (placement === 'Placed' && row.stats.unplaced > 0) return false
      if (placement === 'Unplaced' && row.stats.unplaced === 0) return false
      if (!term) return true
      return [row.id, row.created_by, row.truck?.name ?? ''].some((value) => value.toLowerCase().includes(term))
    })
  }, [rows, query, placement])

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
              placeholder="Search ID, creator, or truck"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="segmented" role="group" aria-label="Filter by placement">
            {FILTERS.map((option) => (
              <button key={option} type="button" aria-pressed={placement === option} onClick={() => setPlacement(option)}>
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
              <th scope="col">Created by</th>
              <th scope="col">Truck</th>
              <th scope="col" className="num">Boxes</th>
              <th scope="col" className="num">Placed</th>
              <th scope="col" className="num">Volume</th>
              <th scope="col" className="num">Payload</th>
              <th scope="col">Created</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="font-semibold text-ink tabular-nums">{row.id}</td>
                <td className="max-w-48 truncate" title={row.created_by}>
                  {row.created_by || '—'}
                </td>
                <td>
                  {row.truck ? (
                    <>
                      <span className="font-medium">{row.truck.name}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-faint tabular-nums">{formatTruckSize(row.truck)}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="num">{row.stats.requested}</td>
                <td className="num">
                  {row.stats.placed}
                  {row.stats.unplaced > 0 ? <span className="text-ink-faint"> · {row.stats.unplaced} left out</span> : null}
                </td>
                <td className="num">
                  <UsageMeter value={row.stats.volume_percent} label="Volume used" />
                </td>
                <td className="num">
                  <UsageMeter value={row.stats.weight_percent} label="Payload used" />
                </td>
                <td className="text-ink-muted tabular-nums">{formatShipmentDate(row.created_at)}</td>
                <td className="text-right">
                  <Link
                    to={`/shipments/${encodeURIComponent(row.id)}`}
                    className="btn btn-ghost btn-sm"
                    aria-label={`Open 3D plan for ${row.id}`}
                  >
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
          <strong>{rows.length === 0 ? 'No shipments yet' : 'No shipments match'}</strong>
          {rows.length === 0 ? 'Generated bills of lading show up here.' : 'Change the search text or the placement filter.'}
        </div>
      ) : null}
    </>
  )
}
