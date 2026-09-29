import { useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, LoaderCircle, Boxes } from 'lucide-react'
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
import { DEFAULT_TRAILER_SPEC, type NewShipmentState } from '../lib/trailer'
import { trailerTypeById, typeForSpec } from '../lib/trailerTypes'
import type { CargoItem, CargoPlacement, TrailerSpec } from '../types'

export function CreateShipmentPage() {
  const location = useLocation()
  const [shipmentId] = useState(newShipmentId)
  const [trailer, setTrailer] = useState<TrailerSpec>(
    () => (location.state as NewShipmentState | null)?.trailer ?? DEFAULT_TRAILER_SPEC,
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

  return (
    <div className="page shipment-workspace">
      <main id="main" className="relative flex h-full min-h-0 flex-col">
        <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(220px,40vh)_minmax(0,1fr)] lg:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <aside className="relative z-10 order-2 flex min-h-0 flex-col border-t border-line bg-canvas lg:order-1 lg:border-t-0 lg:border-r">
            <div className="border-b border-line px-4 py-3">
              <Link to="/shipments" className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-accent">
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Shipments
              </Link>
              <h1 className="mt-0.5 text-[17px] font-semibold tracking-tight">New shipment</h1>
              <p className="mono text-[12px] text-ink-faint">{shipmentId}</p>
              <div className="mt-2.5">
                <TrailerSettings
                  trailer={trailer}
                  typeId={trailerTypeId}
                  onChange={changeTrailer}
                  onTypeChange={(typeId, next) => {
                    setTrailerTypeId(typeId)
                    changeTrailer(next)
                  }}
                />
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <CargoObjectList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={updateItem}
                onRemove={removeItem}
                onAdd={addItem}
                onImported={(imported) => {
                  setItems((current) => [...current, ...imported])
                  setSelectedId(imported.at(-1)?.id ?? null)
                  setGenerateError(null)
                  invalidateLayout()
                }}
              />
            </div>
            <div className="grid gap-2 border-t border-line bg-canvas px-4 py-3">
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

          <LoadViewport
            className="order-1 lg:order-2"
            packed={packed}
            selectedId={selectedId}
            onSelect={setSelectedId}
            stats={stats}
            trailer={trailer}
            model={trailerTypeById(trailerTypeId).model}
            maxWeightKg={trailer.maxWeightKg}
          />
        </div>
      </main>
    </div>
  )
}
