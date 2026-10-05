import type { TrailerForm } from '../../hooks/useTrailerForm'
import type { TrailerField } from '../../types'
import { cubicVolume, limitsFor, parseDimension } from '../../lib/format'
import { TrailerPreview } from './TrailerPreview'

const FIELDS: { key: TrailerField; label: string; optional?: boolean }[] = [
  { key: 'length', label: 'Length' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
  { key: 'maxWeight', label: 'Max payload', optional: true },
]

type TrailerDimensionsFormProps = {
  form: TrailerForm
  /** Fields only, sized for the workspace sidebar. */
  compact?: boolean
  idPrefix?: string
}

export function TrailerDimensionsForm({ form, compact = false, idPrefix = 'dim' }: TrailerDimensionsFormProps) {
  const { units, values, errors, touched } = form
  const limits = limitsFor(units)

  const fields = (
    <div className={`grid gap-x-3 gap-y-1 ${compact ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {FIELDS.map((field) => {
        const error = touched[field.key] ? errors[field.key] : undefined
        const limit = limits[field.key]
        const inputId = `${idPrefix}-${field.key}`
        const errorId = `${inputId}-error`
        return (
          <div className={`field min-w-0 ${compact && field.optional ? 'mt-2 ' : ''}${field.optional ? (compact ? 'col-span-3' : 'sm:col-span-3') : ''}`} key={field.key}>
            <label className={compact ? 'text-[12px] font-medium text-ink-faint' : 'field-label'} htmlFor={inputId}>
              {field.label}
              {field.optional ? <span className="optional font-normal text-ink-faint"> (optional)</span> : null}
            </label>
            <div className="input-suffix">
              <input
                id={inputId}
                className={`field-input tabular-nums${compact ? ' min-h-9 text-[13px]' : ''}${error ? ' is-invalid' : ''}`}
                inputMode="decimal"
                type="text"
                name={field.key}
                value={values[field.key]}
                onChange={(event) => form.setField(field.key, event.target.value)}
                onBlur={() => form.blurField(field.key)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                placeholder={`${limit.min}–${limit.max.toLocaleString()}`}
              />
              <span className="suffix">{limit.unit}</span>
            </div>
            {compact ? null : (
              <p className="field-error" id={errorId} role={error ? 'alert' : undefined}>
                {error ?? ''}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )

  // The compact columns are too narrow for inline messages, so they share one line below the fields.
  const compactErrors = FIELDS.filter((field) => touched[field.key] && errors[field.key])

  const unitSwitch = (
    <div className="segmented" role="group" aria-label="Unit system">
      <button type="button" aria-pressed={units === 'metric'} onClick={() => form.switchUnits('metric')}>
        Metric
      </button>
      <button type="button" aria-pressed={units === 'imperial'} onClick={() => form.switchUnits('imperial')}>
        Imperial
      </button>
    </div>
  )

  if (compact) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-ink-faint">Units</span>
          {unitSwitch}
        </div>
        {fields}
        <div className="mt-1 min-h-5" role={compactErrors.length ? 'alert' : undefined}>
          {compactErrors.map((field) => (
            <p key={field.key} className="text-[12px] text-danger" id={`${idPrefix}-${field.key}-error`}>
              {field.label}: {errors[field.key]}
            </p>
          ))}
        </div>
      </div>
    )
  }

  const volume = cubicVolume(values, units)
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="field-label">Unit system</span>
          {unitSwitch}
        </div>
        {fields}
        <p className="field-hint">
          Leave the fields empty to use the standard 16.55 × 2.55 × 4.0 m trailer. You can change the size in the next step.
        </p>
      </div>

      <aside className="rounded-[var(--radius)] border border-line bg-canvas-muted p-4" aria-label="Trailer preview">
        <div className="mb-2 flex justify-between text-[12px] font-semibold tracking-[0.04em] text-ink-faint uppercase">
          <span>Preview</span>
          <span>{units === 'metric' ? 'Metres' : 'Feet'}</span>
        </div>
        <TrailerPreview
          length={parseDimension(values.length) ?? 0}
          width={parseDimension(values.width) ?? 0}
          height={parseDimension(values.height) ?? 0}
          units={units}
        />
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-line bg-canvas px-3 py-2">
            <dt className="text-[12px] text-ink-faint">Cubic volume</dt>
            <dd className="text-[15px] font-semibold tabular-nums">{volume ?? '—'}</dd>
          </div>
          <div className="rounded-md border border-line bg-canvas px-3 py-2">
            <dt className="text-[12px] text-ink-faint">Payload limit</dt>
            <dd className="text-[15px] font-semibold tabular-nums">
              {values.maxWeight.trim() ? `${values.maxWeight} ${limits.maxWeight.unit}` : 'Not set'}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}
