import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Plus, X } from 'lucide-react'
import { colorFor } from '../../lib/cargo'
import type { CargoFlag, CargoItem } from '../../types'
import { CargoImport } from './CargoImport'

type CargoObjectListProps = {
  items: CargoItem[]
  selectedId: string | null
  /** Bumps when a box is chosen in the 3D view, so the list scrolls to it. */
  scrollToken: number
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CargoItem>) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
  onAdd: () => void
  onImported: (items: CargoItem[], fileName: string) => void
  toolbar?: ReactNode
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

type ItemMeasure = { top: number; height: number }

type DragState = {
  from: number
  to: number
  measures: ItemMeasure[]
}

function scrollToItem(container: HTMLElement, item: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  const fullyVisible = itemRect.top >= containerRect.top - 1 && itemRect.bottom <= containerRect.bottom + 1
  if (fullyVisible) return
  const delta = itemRect.top - containerRect.top - (container.clientHeight - itemRect.height) / 2
  container.scrollTo({ top: Math.max(0, container.scrollTop + delta), behavior: 'smooth' })
}

/** Vertical shift that opens a gap and parks the dragged card inside it. Layout order stays put until drop. */
function previewShift(from: number, to: number, measures: ItemMeasure[]) {
  if (from === to || measures.length === 0 || from < 0 || to < 0 || from >= measures.length || to >= measures.length) {
    return measures.map(() => 0)
  }
  const gap = measures.length > 1 ? measures[1].top - (measures[0].top + measures[0].height) : 0
  const order = measures.map((_, index) => index)
  const [moved] = order.splice(from, 1)
  if (moved === undefined) return measures.map(() => 0)
  order.splice(to, 0, moved)
  const visualTop = new Array<number>(measures.length)
  let y = measures[0].top
  for (const index of order) {
    visualTop[index] = y
    y += measures[index].height + gap
  }
  return measures.map((measure, index) => Math.round(visualTop[index] - measure.top))
}

function previewIndex(index: number, from: number, to: number, count: number) {
  if (from === to) return index
  const order = Array.from({ length: count }, (_, itemIndex) => itemIndex)
  const [moved] = order.splice(from, 1)
  if (moved === undefined) return index
  order.splice(to, 0, moved)
  const next = order.indexOf(index)
  return next === -1 ? index : next
}

export function CargoObjectList({
  items,
  selectedId,
  scrollToken,
  onSelect,
  onChange,
  onRemove,
  onReorder,
  onAdd,
  onImported,
  toolbar,
}: CargoObjectListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const dragRef = useRef<DragState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  useEffect(() => {
    if (scrollToken === 0 || !selectedId) return
    const container = listRef.current
    const item = itemRefs.current.get(selectedId)
    if (!container || !item) return
    const frame = requestAnimationFrame(() => scrollToItem(container, item))
    return () => cancelAnimationFrame(frame)
  }, [scrollToken, selectedId])

  function measureItems() {
    const list = listRef.current
    if (!list) return []
    const listRect = list.getBoundingClientRect()
    return items.map((item) => {
      const rect = itemRefs.current.get(item.id)?.getBoundingClientRect()
      return {
        top: rect ? rect.top - listRect.top + list.scrollTop : 0,
        height: rect?.height ?? 0,
      }
    })
  }

  function indexAt(clientY: number, from: number, measures: ItemMeasure[]) {
    const list = listRef.current
    if (!list || measures.length === 0) return from
    const contentY = clientY - list.getBoundingClientRect().top + list.scrollTop
    let to = from
    for (let index = 0; index < measures.length; index += 1) {
      if (index === from) continue
      const mid = measures[index].top + measures[index].height / 2
      if (from < index && contentY > mid) to = index
      else if (from > index && contentY < mid) to = Math.min(to, index)
    }
    return to
  }

  function onGripPointerDown(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== 0 || items.length < 2) return
    event.preventDefault()
    event.stopPropagation()
    const handle = event.currentTarget
    const pointerId = event.pointerId
    handle.setPointerCapture(pointerId)
    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    const session: DragState = { from: index, to: index, measures: measureItems() }
    dragRef.current = session
    setDrag(session)

    const move = (pointer: PointerEvent) => {
      const current = dragRef.current
      if (!current || pointer.pointerId !== pointerId) return
      const container = listRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        if (pointer.clientY < rect.top + 36) container.scrollTop -= 14
        else if (pointer.clientY > rect.bottom - 36) container.scrollTop += 14
      }
      const next = indexAt(pointer.clientY, current.from, current.measures)
      if (next === current.to) return
      current.to = next
      setDrag({ ...current, measures: current.measures })
    }
    const end = (pointer: PointerEvent) => {
      const current = dragRef.current
      if (!current || pointer.pointerId !== pointerId) return
      dragRef.current = null
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
      setDrag(null)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
      handle.removeEventListener('lostpointercapture', end)
      if (current.to !== current.from) onReorder(current.from, current.to)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
    handle.addEventListener('lostpointercapture', end)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold">Cargo</h2>
          <p className="text-[13px] text-ink-faint">
            {items.length} {items.length === 1 ? 'object' : 'objects'}
            {items.length > 1 ? ' · top is highest priority' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CargoImport onImported={onImported}>
            <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </CargoImport>
          {toolbar}
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto bg-canvas-muted px-3 py-3">
        {items.length === 0 ? (
          <div className="empty-state rounded-[var(--radius)] border border-dashed border-line-strong bg-canvas">
            <strong>No cargo yet</strong>
            Add an object, or import a BOL or spreadsheet.
          </div>
        ) : (
          <ul className="relative flex flex-col gap-2">
            {items.map((item, index) => {
              const selected = item.id === selectedId
              const dragging = drag?.from === index
              const shift = drag ? previewShift(drag.from, drag.to, drag.measures)[index] ?? 0 : 0
              const priority = drag ? previewIndex(index, drag.from, drag.to, items.length) : index
              return (
                <li
                  key={item.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.id, node)
                    else itemRefs.current.delete(item.id)
                  }}
                  className={drag ? 'relative transition-transform duration-200 ease-out' : undefined}
                  style={drag ? { transform: `translateY(${shift}px)`, zIndex: dragging ? 2 : 0 } : undefined}
                >
                  <article
                    className={`rounded-[var(--radius)] border bg-canvas p-3 transition-colors ${
                      selected ? 'border-accent shadow-[0_0_0_3px_rgba(73,10,103,0.12)]' : 'border-line hover:border-line-strong'
                    } ${dragging ? 'shadow-lg' : ''}`}
                    style={dragging ? { opacity: 0.6 } : undefined}
                    onClick={() => onSelect(item.id)}
                    aria-current={selected ? 'true' : undefined}
                  >
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        className="grid h-7 w-5 shrink-0 cursor-grab place-items-center rounded text-ink-faint touch-none hover:bg-canvas-muted hover:text-ink active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
                        aria-label={`Reorder ${item.name}. Priority ${priority + 1}.`}
                        aria-grabbed={dragging ? 'true' : undefined}
                        title="Drag to change priority"
                        disabled={items.length < 2}
                        onPointerDown={(event) => onGripPointerDown(event, index)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowUp' && index > 0) {
                            event.preventDefault()
                            onReorder(index, index - 1)
                          }
                          if (event.key === 'ArrowDown' && index < items.length - 1) {
                            event.preventDefault()
                            onReorder(index, index + 1)
                          }
                        }}
                      >
                        <GripVertical className="h-4 w-4" aria-hidden="true" />
                      </button>
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
                      <div className="flex items-center">
                        <span className="mono min-w-5 text-center text-[12px] text-ink-faint" title="Load priority">
                          {priority + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            className="grid h-4 w-5 place-items-center rounded text-ink-faint hover:bg-canvas-muted hover:text-ink disabled:opacity-30"
                            aria-label={`Move ${item.name} up`}
                            disabled={index === 0}
                            onClick={(event) => {
                              event.stopPropagation()
                              onReorder(index, index - 1)
                            }}
                          >
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="grid h-4 w-5 place-items-center rounded text-ink-faint hover:bg-canvas-muted hover:text-ink disabled:opacity-30"
                            aria-label={`Move ${item.name} down`}
                            disabled={index === items.length - 1}
                            onClick={(event) => {
                              event.stopPropagation()
                              onReorder(index, index + 1)
                            }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
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
