import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import { LoadViewport } from '../components/shipment/LoadViewport'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { cargoStats, colorFor, layoutFromPlacements } from '../lib/cargo'
import { formatPayload, formatTrailer } from '../lib/trailer'
import { trailerTypeById, typeForSpec } from '../lib/trailerTypes'
import {
  formatShipmentDate,
  getShipment,
  isAbortError,
  shipmentLoadError,
  viewModelFromShipment,
  type ShipmentDetail,
} from '../lib/shipments'

const SIDE_BY_SIDE = '(min-width: 1024px)'

function WorkspaceMessage({ title, body, busy = false }: { title: string; body: string; busy?: boolean }) {
  return (
    <div className="page shipment-workspace">
      <main id="main" className="grid h-full place-items-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 flex items-center justify-center gap-2 text-[14px] text-ink-muted">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {body}
          </p>
          {busy ? null : (
            <Link to="/shipments" className="btn btn-primary mt-5">
              Back to shipments
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}

export function ShipmentDetailPage() {
  const { shipmentId = '' } = useParams()
  const sideBySide = useMediaQuery(SIDE_BY_SIDE)
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setShipment(null)
    setError(null)
    setSelectedId(null)
    getShipment(shipmentId, controller.signal)
      .then(setShipment)
      .catch((cause) => {
        if (isAbortError(cause)) return
        setError(shipmentLoadError(cause, 'Could not load this shipment.'))
      })
    return () => controller.abort()
  }, [shipmentId])

  const model = useMemo(() => (shipment ? viewModelFromShipment(shipment) : null), [shipment])
  const packed = useMemo(
    () => (model ? layoutFromPlacements(model.items, model.placements, model.trailer) : []),
    [model],
  )
  const stats = useMemo(
    () => (model ? cargoStats(model.items, packed, model.trailer) : null),
    [model, packed],
  )

  if (error) return <WorkspaceMessage title="Shipment unavailable" body={error} />
  if (!shipment || !model || !stats) {
    return <WorkspaceMessage title={shipmentId} body="Loading the cargo…" busy />
  }

  const trailerType = typeForSpec(model.trailer)
  const payload = formatPayload(model.trailer)

  const cargoPanel = (
    <aside
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-canvas ${
        sideBySide ? 'w-[360px] border-r border-line' : 'max-h-[42%] border-t border-line'
      }`}
      aria-label="Cargo"
    >
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[14px] font-semibold">Cargo</h2>
        <p className="text-[13px] text-ink-faint">
          {model.items.length} {model.items.length === 1 ? 'object' : 'objects'}
          {shipment.stats.unplaced > 0 ? ` · ${shipment.stats.unplaced} left out` : ''}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-canvas-muted px-3 py-3">
        {model.items.length === 0 ? (
          <div className="empty-state rounded-[var(--radius)] border border-dashed border-line-strong bg-canvas">
            <strong>No cargo on this shipment</strong>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {model.items.map((item) => {
              const selected = item.id === selectedId
              const fitted = model.placements.has(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-cargo-id={item.id}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-[var(--radius)] border bg-canvas p-3 text-left transition-colors ${
                      selected ? 'border-accent shadow-[0_0_0_3px_rgba(73,10,103,0.12)]' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: colorFor(item) }} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{item.name}</span>
                      {fitted ? null : <span className="text-[12px] font-medium text-danger">Does not fit</span>}
                    </span>
                    <span className="mt-1 block text-[12px] text-ink-faint tabular-nums">
                      {item.length} × {item.width} × {item.height} cm · {item.weight} kg
                    </span>
                    <span className="mt-1 block text-[12px] text-ink-muted">
                      {[item.fragile && 'Fragile', item.tiltable && 'Tiltable', item.stackable && 'Stackable']
                        .filter(Boolean)
                        .join(' · ') || 'Standard'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )

  const shipmentPanel = (
    <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-line bg-canvas px-4 py-3">
      <Link to="/shipments" className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-accent">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Shipments
      </Link>
      <h1 className="mt-0.5 text-[17px] font-semibold tracking-tight">Shipment</h1>
      <p className="mono text-[12px] text-ink-faint">{shipment.id}</p>
      <dl className="mt-4 grid gap-3 text-[13px]">
        <div>
          <dt className="text-ink-faint">Created by</dt>
          <dd className="font-medium break-all">{shipment.created_by || '—'}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Created</dt>
          <dd className="font-medium">{formatShipmentDate(shipment.created_at)}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">Truck</dt>
          <dd className="font-medium">{shipment.truck.name}</dd>
          <dd className="text-ink-muted tabular-nums">{formatTrailer(model.trailer)}</dd>
          {payload ? <dd className="text-ink-muted">{payload} payload</dd> : null}
        </div>
        <div>
          <dt className="text-ink-faint">Load</dt>
          <dd className="font-medium tabular-nums">
            {shipment.stats.placed} of {shipment.stats.requested} placed
          </dd>
          <dd className="text-ink-muted tabular-nums">
            {shipment.stats.volume_percent}% of the volume · {shipment.stats.weight_percent}% of the payload
          </dd>
        </div>
      </dl>
    </aside>
  )

  return (
    <div className="page shipment-workspace">
      <main id="main" className={`flex h-full min-h-0 ${sideBySide ? 'flex-row' : 'flex-col'}`}>
        {sideBySide ? cargoPanel : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {sideBySide ? null : (
            <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas px-4 py-2">
              <div className="min-w-0">
                <Link to="/shipments" className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-accent">
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Shipments
                </Link>
                <p className="mono truncate text-[13px] font-semibold">{shipment.id}</p>
              </div>
              <p className="shrink-0 text-right text-[12px] text-ink-faint tabular-nums">
                {shipment.truck.name}
                <span className="block">{formatTrailer(model.trailer)}</span>
              </p>
            </div>
          )}
          <LoadViewport
            className="min-h-[220px] min-w-0 flex-1"
            packed={packed}
            selectedId={selectedId}
            onSelect={setSelectedId}
            stats={stats}
            trailer={model.trailer}
            model={trailerTypeById(trailerType.id).model}
            maxWeightKg={model.trailer.maxWeightKg}
          />
        </div>
        {sideBySide ? shipmentPanel : cargoPanel}
      </main>
    </div>
  )
}
