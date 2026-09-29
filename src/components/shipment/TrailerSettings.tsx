import { useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { useTrailerForm } from '../../hooks/useTrailerForm'
import { formatPayload, formatTrailer } from '../../lib/trailer'
import type { TrailerSpec } from '../../types'
import { TrailerDimensionsForm } from '../page1-main/TrailerDimensions'

type TrailerSettingsProps = {
  trailer: TrailerSpec
  onChange: (trailer: TrailerSpec) => void
}

export function TrailerSettings({ trailer, onChange }: TrailerSettingsProps) {
  const [editing, setEditing] = useState(false)
  const form = useTrailerForm(trailer)
  const payload = formatPayload(trailer)

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
          Edit trailer
        </button>
      </div>
    )
  }

  return (
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
  )
}
