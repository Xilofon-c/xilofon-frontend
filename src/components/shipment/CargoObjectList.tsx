import type { CargoFlag, CargoItem } from '../../types'

type CargoObjectListProps = {
  items: CargoItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CargoItem>) => void
  onRemove: (id: string) => void
  onAdd: () => void
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
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase">{label}</span>
      <span className="relative block">
        <input
          id={id}
          className="field-input min-h-10 px-2.5 pr-9 text-[13px]"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px] text-ink-faint">
          {suffix}
        </span>
      </span>
    </label>
  )
}

export function CargoObjectList({
  items,
  selectedId,
  onSelect,
  onChange,
  onRemove,
  onAdd,
}: CargoObjectListProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-accent uppercase">Objects</p>
          <p className="text-[13px] text-ink-muted">{items.length} in this shipment</p>
        </div>
        <button type="button" className="btn btn-ghost min-h-9 px-3 text-[13px]" onClick={onAdd}>
          Add
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong bg-canvas-muted px-4 py-8 text-center text-[13px] text-ink-muted">
            No cargo yet. Add an object or import a BOL / spreadsheet below.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item, index) => {
              const selected = item.id === selectedId
              return (
                <li key={item.id}>
                  <article
                    className={`rounded-xl border bg-canvas p-3 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition ${
                      selected ? 'border-accent ring-2 ring-[rgba(73,10,103,0.12)]' : 'border-line'
                    }`}
                    onClick={() => onSelect(item.id)}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: item.fragile ? '#c2410c' : item.tiltable ? '#0369a1' : '#81468d' }}
                        aria-hidden="true"
                      />
                      <label className="min-w-0 flex-1">
                        <span className="visually-hidden">Object name</span>
                        <input
                          className="w-full min-w-0 border-0 bg-transparent text-[14px] font-semibold text-ink outline-none"
                          value={item.name}
                          onChange={(event) => onChange(item.id, { name: event.target.value })}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </label>
                      <span className="text-[11px] text-ink-faint">#{index + 1}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-canvas-muted hover:text-danger"
                        aria-label={`Remove ${item.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onRemove(item.id)
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
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

                    <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Handling flags">
                      {FLAGS.map((flag) => {
                        const pressed = item[flag.key]
                        return (
                          <button
                            key={flag.key}
                            type="button"
                            title={flag.hint}
                            aria-pressed={pressed}
                            className={`min-h-8 rounded-full border px-2.5 text-[11px] font-semibold tracking-wide uppercase transition ${
                              pressed
                                ? 'border-accent bg-accent text-white'
                                : 'border-line-strong bg-canvas-muted text-ink-muted hover:border-accent hover:text-accent'
                            }`}
                            onClick={(event) => {
                              event.stopPropagation()
                              onChange(item.id, { [flag.key]: !pressed })
                            }}
                          >
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
