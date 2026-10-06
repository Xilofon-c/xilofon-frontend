import { useState, type FormEvent } from 'react'
import { Container, Pencil, Trailer, Truck } from 'lucide-react'
import { useTrailerForm } from '../../hooks/useTrailerForm'
import { formatPayload, formatTrailer } from '../../lib/trailer'
import { hasPresetSize, TRAILER_TYPES, trailerTypeById } from '../../lib/trailerTypes'
import type { TrailerSpec } from '../../types'
import { TrailerDimensionsForm } from '../page1-main/TrailerDimensions'




type TrailerSettingsProps = {
  trailer: TrailerSpec
  typeId: string
  onChange: (trailer: TrailerSpec) => void
  /** Sets the type and replaces the size with the type's preset. */
  onTypeChange: (typeId: string, trailer: TrailerSpec) => void
}


    const TrailerIcon = ({ typeId }: { typeId: string }) => {
  if (typeId === 'container-40' || typeId === 'container-20') {
    return <Container size={24} strokeWidth={1.7} />
  }

  if (typeId === 'curtainsider' || typeId === 'mega') {
    return <Trailer size={24} strokeWidth={1.7} />
  }

  return <Truck size={24} strokeWidth={1.7} />
}

export function TrailerSettings({ trailer, typeId, onChange, onTypeChange }: TrailerSettingsProps) {
 const [editing, setEditing] = useState(false)
const [typeOpen, setTypeOpen] = useState(false)
  const form = useTrailerForm(trailer)
  const payload = formatPayload(trailer)
  const type = trailerTypeById(typeId)
  const customSize = !hasPresetSize(type, trailer)

 


   const typeSelect = (
  <div className="field relative mb-3">
    <label
      className="text-[12px] font-medium text-ink-faint"
      htmlFor="trailer-type"
    >
      Trailer type
    </label>

    <button
      id="trailer-type"
      type="button"
      className="field-input flex min-h-10 w-full items-center justify-between text-[14px]"
      onClick={() => setTypeOpen((open) => !open)}
    >
      <span>{type.label}</span>

      <TrailerIcon typeId={type.id} />
    </button>

    {typeOpen ? (
      <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-line bg-white shadow-lg">
        {TRAILER_TYPES.map((option) => (
          <button
            key={option.id}
            type="button"
            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[14px] hover:bg-canvas-muted"
            onClick={() => {
              const next = trailerTypeById(option.id)

              onTypeChange(next.id, {
                ...next.spec,
                units: trailer.units,
              })

              setEditing(false)
              setTypeOpen(false)
            }}
          >
            <span>{option.label}</span>

            <TrailerIcon typeId={option.id} />
          </button>
        ))}
      </div>
    ) : null}

    {customSize ? (
      <p className="field-hint">
        Custom size. Select the type again to restore its size.
      </p>
    ) : null}
  </div>
)
  
  function startEditing() {
    form.reset(trailer)
    setEditing(true)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = form.validateAll()
    if (!next) return
    onChange(next)
    setEditing(false)
  }

  if (!editing) {
    return (
      <>
      {typeSelect}
      <div className="flex items-center justify-between gap-3">
        <dl className="min-w-0 text-[12px]">
          <div className="flex gap-1.5">
            <dt className="text-ink-faint">Trailer</dt>
            <dd className="font-medium text-ink tabular-nums">{formatTrailer(trailer)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-ink-faint">Payload</dt>
            <dd className="font-medium text-ink tabular-nums">{payload ?? 'No limit set'}</dd>
          </div>
        </dl>
        <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={startEditing}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit size
        </button>
      </div>
      </>
    )
  }

  return (
    <>
    {typeSelect}
    <form
      className="rounded-[var(--radius)] border border-line bg-canvas-muted p-3"
      onSubmit={onSubmit}
      noValidate
      aria-label="Trailer dimensions"
    >
      <TrailerDimensionsForm form={form} compact idPrefix="trailer" />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          Apply
        </button>
      </div>
    </form>
    </>
  )
}
