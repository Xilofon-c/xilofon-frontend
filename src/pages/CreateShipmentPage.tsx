import { useMemo, useState } from 'react'
import { CargoImport } from '../components/shipment/CargoImport'
import { CargoObjectList } from '../components/shipment/CargoObjectList'
import { LoadViewport } from '../components/shipment/LoadViewport'
import { generateBolPdf } from '../lib/bolApi'
import { cargoHasDimensions, cargoStats, createCargoItem, DEFAULT_TRAILER, newShipmentId, packCargo } from '../lib/cargo'
import { parseDimension } from '../lib/format'
import type { CargoItem } from '../types'

export function CreateShipmentPage() {
  const [shipmentId] = useState(newShipmentId)
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

  const packed = useMemo(() => packCargo(items), [items])
  const stats = useMemo(() => cargoStats(items, packed), [items, packed])

  function addItem() {
    const next = createCargoItem({ name: `Box ${items.length + 1}` })
    setItems((current) => [...current, next])
    setSelectedId(next.id)
    setGenerateError(null)
  }

  function updateItem(id: string, patch: Partial<CargoItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }

  async function onGenerate() {
    const ready = items.filter(cargoHasDimensions)
    if (ready.length === 0) {
      setGenerateError('Add at least one object with length, width, and height.')
      return
    }

    setGenerating(true)
    setGenerateError(null)
    try {
      await generateBolPdf({
        shipmentId,
        trailer: {
          lengthM: DEFAULT_TRAILER.length,
          widthM: DEFAULT_TRAILER.width,
          heightM: DEFAULT_TRAILER.height,
        },
        items: ready.map((item) => ({
          id: item.id,
          name: item.name.trim() || 'Cargo',
          lengthCm: parseDimension(item.length) ?? 0,
          widthCm: parseDimension(item.width) ?? 0,
          heightCm: parseDimension(item.height) ?? 0,
          weightKg: parseDimension(item.weight) ?? 0,
          fragile: item.fragile,
          tiltable: item.tiltable,
          stackable: item.stackable,
        })),
      })
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Could not generate the BOL.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page shipment-workspace">
      <main id="main" className="relative flex h-full min-h-0 flex-col">
        <div className="absolute top-3 right-3 z-30 flex max-w-[min(100%-1.5rem,24rem)] flex-col items-end gap-2">
          <button
            type="button"
            className="btn btn-primary min-h-10 px-5 shadow-[0_8px_20px_rgba(73,10,103,0.22)]"
            onClick={() => void onGenerate()}
            disabled={generating}
            aria-busy={generating}
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
          {generateError ? (
            <p className="rounded-lg bg-white/95 px-3 py-2 text-right text-[12px] text-danger shadow-sm" role="alert">
              {generateError}
            </p>
          ) : null}
        </div>

        <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(220px,42vh)_minmax(0,1fr)] lg:grid-cols-[minmax(20rem,24.5rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <aside className="relative z-10 order-2 flex min-h-0 flex-col border-t border-line bg-canvas lg:order-1 lg:border-t-0 lg:border-r">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-ink-faint uppercase">New shipment</p>
              <p className="font-mono text-[13px] font-semibold tracking-tight text-ink">{shipmentId}</p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <CargoObjectList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={updateItem}
                onRemove={removeItem}
                onAdd={addItem}
              />
            </div>
            <div className="shrink-0 border-t border-line bg-canvas">
              <CargoImport
                onImported={(imported) => {
                  setItems((current) => [...current, ...imported])
                  setSelectedId(imported.at(-1)?.id ?? null)
                  setGenerateError(null)
                }}
              />
            </div>
          </aside>

          <LoadViewport
            className="order-1 lg:order-2"
            packed={packed}
            selectedId={selectedId}
            onSelect={setSelectedId}
            stats={stats}
          />
        </div>
      </main>
    </div>
  )
}
