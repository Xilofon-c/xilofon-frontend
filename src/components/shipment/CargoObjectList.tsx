import { Plus, X } from 'lucide-react'
import { colorFor } from '../../lib/cargo'
import type { CargoFlag, CargoItem } from '../../types'
import { CargoImport } from './CargoImport'

type CargoObjectListProps = {
  items: CargoItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CargoItem>) => void
  onRemove: (id: string) => void
  onAdd: () => void
  onImported: (items: CargoItem[], fileName: string) => void
}

const FLAGS: { key: CargoFlag; label: string; hint: string }[] = [
  { key: 'fragile', label: 'Fragile', hint: 'Keep upright. Nothing stacked on this box.' },
  { key: 'tiltable', label: 'Tiltable', hint: 'May be rotated to fit remaining space.' },
  { key: 'stackable', label: 'Stackable', hint: 'Other cargo may be placed on top.' },
]

function DimField({
  id,
  label,
  suffix,
  value,
  onChange,
}: {
  id: string
  label: string
  suffix: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[12px] font-medium text-ink-faint">
        {label}
      </label>
      <span className="input-suffix block">
        <input
          id={id}
          className="field-input min-h-9 px-2.5 pr-9 text-[13px] tabular-nums"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
        />
        <span className="suffix right-2.5 text-[11px]">{suffix}</span>
      </span>
    </div>
  )
}

export function CargoObjectList({
  items,
  selectedId,
  onSelect,
  onChange,
  onRemove,
  onAdd,
  onImported,
}: CargoObjectListProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold">Cargo</h2>
          <p className="text-[13px] text-ink-faint">
            {items.length} {items.length === 1 ? 'object' : 'objects'}
          </p>
        </div>
        <CargoImport onImported={onImported}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </CargoImport>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-canvas-muted px-3 py-3">
        {items.length === 0 ? (
          <div className="empty-state rounded-[var(--radius)] border border-dashed border-line-strong bg-canvas">
            <strong>No cargo yet</strong>
            Add an object, or import a BOL or spreadsheet.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => {
              const selected = item.id === selectedId
              return (
                <li key={item.id}>
                  <article
                    className={`rounded-[var(--radius)] border bg-canvas p-3 transition-colors ${
                      selected ? 'border-accent shadow-[0_0_0_3px_rgba(73,10,103,0.12)]' : 'border-line hover:border-line-strong'
                    }`}
                    onClick={() => onSelect(item.id)}
                    aria-current={selected ? 'true' : undefined}
                  >
                    <div className="mb-2.5 flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ background: colorFor(item) }}
                        aria-hidden="true"
                      />
                      <label className="min-w-0 flex-1">
                        <span className="visually-hidden">Object name</span>
                        <input
                          className="-mx-1 w-full min-w-0 rounded border-0 bg-transparent px-1 py-0.5 text-[14px] font-semibold text-ink outline-none hover:bg-canvas-muted focus:bg-canvas-muted focus-visible:outline-2 focus-visible:outline-accent"
                          value={item.name}
                          onChange={(event) => onChange(item.id, { name: event.target.value })}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </label>
                      <span className="mono text-[12px] text-ink-faint">#{index + 1}</span>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                        aria-label={`Remove ${item.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onRemove(item.id)
                        }}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <DimField
                        id={`${item.id}-l`}
                        label="Length"
                        suffix="cm"
                        value={item.length}
                        onChange={(length) => onChange(item.id, { length })}
                      />
                      <DimField
                        id={`${item.id}-w`}
                        label="Width"
                        suffix="cm"
                        value={item.width}
                        onChange={(width) => onChange(item.id, { width })}
                      />
                      <DimField
                        id={`${item.id}-h`}
                        label="Height"
                        suffix="cm"
                        value={item.height}
                        onChange={(height) => onChange(item.id, { height })}
                      />
                      <DimField
                        id={`${item.id}-kg`}
                        label="Weight"
                        suffix="kg"
                        value={item.weight}
                        onChange={(weight) => onChange(item.id, { weight })}
                      />
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Handling">
                      {FLAGS.map((flag) => {
                        const pressed = item[flag.key]
                        return (
                          <button
                            key={flag.key}
                            type="button"
                            title={flag.hint}
                            aria-pressed={pressed}
                            className={`min-h-7 rounded border px-2 text-[12px] font-medium transition-colors ${
                              pressed
                                ? 'border-accent-line bg-accent-soft text-accent'
                                : 'border-line bg-canvas text-ink-faint hover:border-line-strong hover:text-ink'
                            }`}
                            onClick={(event) => {
                              event.stopPropagation()
                              onChange(item.id, { [flag.key]: !pressed })
                            }}
                          >
                            {pressed ? '✓ ' : ''}
                            {flag.label}
                          </button>
                        )
                      })}
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
