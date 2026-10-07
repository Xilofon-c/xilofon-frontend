import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Boxes, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LoaderCircle } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { CargoObjectList } from '../components/shipment/CargoObjectList'
import { LoadViewport } from '../components/shipment/LoadViewport'
import { TrailerSettings } from '../components/shipment/TrailerSettings'
import {
  cargoHasDimensions,
  cargoStats,
  createCargoItem,
  layoutFromPlacements,
  newShipmentId,
  packCargo,
} from '../lib/cargo'
import { parseDimension } from '../lib/format'
import { calculateLoad } from '../lib/packingApi'
import type { NewShipmentState } from '../lib/trailer'
import { DEFAULT_TRAILER_TYPE, trailerTypeById, typeForSpec } from '../lib/trailerTypes'
import type { CargoItem, CargoPlacement, TrailerSpec } from '../types'

const SIDE_BY_SIDE = '(min-width: 1024px)'
const CARGO_DEFAULT = 400
const SHIPMENT_DEFAULT = 340
const CARGO_MIN = 320
const SHIPMENT_MIN = 280
const CARGO_MAX = 680
const SHIPMENT_MAX = 520
const VIEW_MIN = 240

function clamp(value: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, value)))
}

function ResizeHandle({
  axis,
  label,
  onDrag,
  onReset,
}: {
  axis: 'x' | 'y'
  label: string
  onDrag: (delta: number) => void
  onReset: () => void
}) {
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.preventDefault()
    const handle = event.currentTarget
    const origin = axis === 'x' ? event.clientX : event.clientY
    handle.setPointerCapture(event.pointerId)
    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    const move = (pointer: PointerEvent) => {
      const current = axis === 'x' ? pointer.clientX : pointer.clientY
      onDrag(current - origin)
    }
    const end = () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }

  return (
    <div
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={label}
      tabIndex={0}
      title="Drag to resize. Double-click to reset."
      className={
        axis === 'x'
          ? 'group relative z-20 -mx-1.5 w-3 shrink-0 cursor-col-resize touch-none'
          : 'group relative z-20 -my-1.5 h-3 shrink-0 cursor-row-resize touch-none'
      }
      onPointerDown={onPointerDown}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16
        if (axis === 'x' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault()
          onDrag(event.key === 'ArrowRight' ? step : -step)
        }
        if (axis === 'y' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault()
          onDrag(event.key === 'ArrowDown' ? step : -step)
        }
      }}
    >
      <span
        aria-hidden="true"
        className={
          axis === 'x'
            ? 'absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line group-hover:bg-accent group-focus-visible:bg-accent'
            : 'absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line group-hover:bg-accent group-focus-visible:bg-accent'
        }
      />
      <span
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-canvas group-hover:border-accent ${
          axis === 'x' ? 'h-8 w-1.5' : 'h-1.5 w-8'
        }`}
      />
    </div>
  )
}

function PanelRail({
  label,
  edge,
  onExpand,
}: {
  label: string
  edge: 'left' | 'right' | 'bottom'
  onExpand: () => void
}) {
  const vertical = edge !== 'bottom'
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label={`Show ${label} panel`}
      className={
        vertical
          ? `flex h-full w-11 shrink-0 flex-col items-center gap-3 bg-canvas py-3 text-ink-muted hover:bg-canvas-muted hover:text-ink ${
              edge === 'left' ? 'border-r border-line' : 'border-l border-line'
            }`
          : 'flex h-11 w-full shrink-0 items-center gap-2 border-t border-line bg-canvas px-3 text-[13px] font-medium text-ink-muted hover:bg-canvas-muted hover:text-ink'
      }
    >
      {edge === 'left' ? (
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      ) : edge === 'right' ? (
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      )}
      <span className={vertical ? 'text-[12px] font-medium [writing-mode:vertical-rl]' : undefined}>{label}</span>
    </button>
  )
}

export function CreateShipmentPage() {
  const location = useLocation()
  const [shipmentId] = useState(newShipmentId)
  const [trailer, setTrailer] = useState<TrailerSpec>(
    () =>
      (location.state as NewShipmentState | null)?.trailer ?? { ...DEFAULT_TRAILER_TYPE.spec, units: 'metric' },
  )
  const [trailerTypeId, setTrailerTypeId] = useState(() => typeForSpec(trailer).id)
  const [items, setItems] = useState<CargoItem[]>(() => [
    createCargoItem({
      name: 'Pump crate',
      length: '120',
      width: '80',
      height: '90',
      weight: '48',
      fragile: true,
      stackable: false,
    }),
    createCargoItem({
      name: 'Filter carton',
      length: '40',
      width: '30',
      height: '30',
      weight: '6',
    }),
    createCargoItem({
      name: 'Valve box',
      length: '60',
      width: '40',
      height: '35',
      weight: '14',
      tiltable: true,
    }),
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [placements, setPlacements] = useState<Map<string, CargoPlacement> | null>(null)
  const layoutRevision = useRef(0)
  const frameRef = useRef<HTMLDivElement>(null)
  const sideBySide = useMediaQuery(SIDE_BY_SIDE)
  const [cargoWidth, setCargoWidth] = useState(CARGO_DEFAULT)
  const [shipmentWidth, setShipmentWidth] = useState(SHIPMENT_DEFAULT)
  const [cargoHeight, setCargoHeight] = useState(300)
  const [shipmentHeight, setShipmentHeight] = useState(220)
  const [cargoOpen, setCargoOpen] = useState(true)
  const [shipmentOpen, setShipmentOpen] = useState(true)

  function fit(next: number, other: number, otherOpen: boolean, min: number, max: number) {
    const frame = frameRef.current
    const space = frame ? (sideBySide ? frame.clientWidth : frame.clientHeight) : max + VIEW_MIN
    const taken = (otherOpen ? other : 44) + (sideBySide ? VIEW_MIN : 160)
    return clamp(next, min, Math.max(min, Math.min(max, space - taken)))
  }

  const packed = useMemo(
    () => (placements ? layoutFromPlacements(items, placements, trailer) : packCargo(items, trailer)),
    [items, placements, trailer],
  )
  const stats = useMemo(() => cargoStats(items, packed, trailer), [items, packed, trailer])

  function invalidateLayout() {
    layoutRevision.current += 1
    setPlacements(null)
  }

  function changeTrailer(next: TrailerSpec) {
    setTrailer(next)
    setGenerateError(null)
    invalidateLayout()
  }

  function addItem() {
    const next = createCargoItem({ name: `Box ${items.length + 1}` })
    setItems((current) => [...current, next])
    setSelectedId(next.id)
    setGenerateError(null)
    invalidateLayout()
  }

  function updateItem(id: string, patch: Partial<CargoItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    if (Object.keys(patch).some((key) => key !== 'name')) invalidateLayout()
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
    setSelectedId((current) => (current === id ? null : current))
    invalidateLayout()
  }

  async function onGenerate() {
    const ready = items.filter(cargoHasDimensions)
    if (ready.length === 0) {
      setGenerateError('Add at least one object with length, width, and height.')
      return
    }
    const weightless = ready.filter((item) => (parseDimension(item.weight) ?? 0) <= 0)
    if (weightless.length > 0) {
      setGenerateError(`Add a weight to: ${weightless.map((item) => item.name.trim() || 'Cargo').join(', ')}.`)
      return
    }

    const revision = layoutRevision.current
    setGenerating(true)
    setGenerateError(null)
    try {
      const next = await calculateLoad(ready, trailer, trailer.maxWeightKg)
      if (layoutRevision.current === revision) setPlacements(next)
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Could not calculate the load.')
    } finally {
      setGenerating(false)
    }
  }

  const collapseCargo = (
    <button
      type="button"
      className="btn btn-quiet btn-sm px-2"
      aria-expanded={cargoOpen}
      aria-controls="cargo-panel"
      title="Collapse cargo"
      onClick={() => setCargoOpen(false)}
    >
      {sideBySide ? (
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="visually-hidden">Collapse cargo</span>
    </button>
  )

  const cargoPanel = (
    <aside
      id="cargo-panel"
      style={sideBySide ? { width: cargoWidth } : { height: cargoHeight }}
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-canvas ${sideBySide ? 'border-r border-line' : 'border-t border-line'}`}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <CargoObjectList
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={updateItem}
          onRemove={removeItem}
          onAdd={addItem}
          toolbar={collapseCargo}
          onImported={(imported) => {
            setItems((current) => [...current, ...imported])
            setSelectedId(imported.at(-1)?.id ?? null)
            setGenerateError(null)
            invalidateLayout()
          }}
        />
      </div>
      <div className="grid shrink-0 gap-2 border-t border-line bg-canvas px-4 py-3">
        {generateError ? (
          <p className="alert alert-danger" role="alert">
            {generateError}
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => void onGenerate()}
          disabled={generating || items.length === 0}
          aria-busy={generating}
        >
          {generating ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Boxes className="h-4 w-4" aria-hidden="true" />
          )}
          {generating ? 'Calculating…' : placements ? 'Recalculate load plan' : 'Generate load plan'}
        </button>
        <p className="text-center text-[12px] text-ink-faint">
          {placements
            ? 'Showing the optimised plan. Edits reset it to the draft layout.'
            : 'Showing a draft layout. Generate to optimise it.'}
        </p>
      </div>
    </aside>
  )

  const shipmentPanel = (
    <aside
      id="shipment-panel"
      style={sideBySide ? { width: shipmentWidth } : { height: shipmentHeight }}
      className={`min-h-0 shrink-0 overflow-y-auto bg-canvas px-4 py-3 ${sideBySide ? 'border-l border-line' : 'border-t border-line'}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to="/shipments" className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-accent">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Shipments
          </Link>
          <h1 className="mt-0.5 text-[17px] font-semibold tracking-tight">New shipment</h1>
          <p className="mono text-[12px] text-ink-faint">{shipmentId}</p>
        </div>
        <button
          type="button"
          className="btn btn-quiet btn-sm px-2"
          aria-expanded={shipmentOpen}
          aria-controls="shipment-panel"
          title="Collapse shipment"
          onClick={() => setShipmentOpen(false)}
        >
          {sideBySide ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="visually-hidden">Collapse shipment</span>
        </button>
      </div>
      <TrailerSettings
        trailer={trailer}
        typeId={trailerTypeId}
        onChange={changeTrailer}
        onTypeChange={(typeId, next) => {
          setTrailerTypeId(typeId)
          changeTrailer(next)
        }}
      />
    </aside>
  )

  const viewport = (
    <LoadViewport
      className="min-h-[140px] min-w-0 flex-1"
      packed={packed}
      selectedId={selectedId}
      onSelect={setSelectedId}
      stats={stats}
      trailer={trailer}
      model={trailerTypeById(trailerTypeId).model}
      maxWeightKg={trailer.maxWeightKg}
    />
  )

  return (
    <div className="page shipment-workspace">
      <main id="main" className="relative flex h-full min-h-0 flex-col">
        <div ref={frameRef} className={`flex h-full min-h-0 ${sideBySide ? 'flex-row' : 'flex-col'}`}>
          {sideBySide ? (
            cargoOpen ? (
              cargoPanel
            ) : (
              <PanelRail edge="left" label="Cargo" onExpand={() => setCargoOpen(true)} />
            )
          ) : null}
          {sideBySide && cargoOpen ? (
            <ResizeHandle
              axis="x"
              label="Resize cargo panel"
              onDrag={(delta) => setCargoWidth(fit(cargoWidth + delta, shipmentWidth, shipmentOpen, CARGO_MIN, CARGO_MAX))}
              onReset={() => setCargoWidth(CARGO_DEFAULT)}
            />
          ) : null}

          {viewport}

          {shipmentOpen ? (
            <ResizeHandle
              axis={sideBySide ? 'x' : 'y'}
              label="Resize shipment panel"
              onDrag={(delta) =>
                sideBySide
                  ? setShipmentWidth(fit(shipmentWidth - delta, cargoWidth, cargoOpen, SHIPMENT_MIN, SHIPMENT_MAX))
                  : setShipmentHeight(fit(shipmentHeight - delta, cargoHeight, cargoOpen, 180, 520))
              }
              onReset={() => (sideBySide ? setShipmentWidth(SHIPMENT_DEFAULT) : setShipmentHeight(220))}
            />
          ) : null}
          {shipmentOpen ? (
            shipmentPanel
          ) : (
            <PanelRail edge={sideBySide ? 'right' : 'bottom'} label="Shipment" onExpand={() => setShipmentOpen(true)} />
          )}

          {!sideBySide && cargoOpen ? (
            <ResizeHandle
              axis="y"
              label="Resize cargo panel"
              onDrag={(delta) => setCargoHeight(fit(cargoHeight - delta, shipmentHeight, shipmentOpen, 180, 640))}
              onReset={() => setCargoHeight(300)}
            />
          ) : null}
          {!sideBySide ? (
            cargoOpen ? (
              cargoPanel
            ) : (
              <PanelRail edge="bottom" label="Cargo" onExpand={() => setCargoOpen(true)} />
            )
          ) : null}
        </div>
      </main>
    </div>
  )
}
