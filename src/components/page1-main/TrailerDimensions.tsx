import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FieldErrors, TrailerDimensions, TrailerField, UnitSystem } from '../../types'
import { cubicVolume, limitsFor, parseDimension } from '../../lib/format'
import { validateTrailer } from '../../lib/validate'
import { TrailerPreview } from './TrailerPreview'
import './TrailerDimensions.css'
import { BolUpload } from './BolUpload'


const EMPTY: TrailerDimensions = {
  length: '',
  width: '',
  height: '',
  maxWeight: '',
}

const FIELDS: { key: TrailerField; label: string; optional?: boolean }[] = [
  { key: 'length', label: 'Length' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
  { key: 'maxWeight', label: 'Max payload', optional: true },
]

export function TrailerDimensionsSection() {
  const [units, setUnits] = useState<UnitSystem>('metric')
  const [values, setValues] = useState<TrailerDimensions>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<TrailerField, boolean>>>({})
  const [locked, setLocked] = useState(false)

  const limits = limitsFor(units)
  const volume = cubicVolume(values, units)

  const parsed = useMemo(
    () => ({
      length: parseDimension(values.length) ?? 0,
      width: parseDimension(values.width) ?? 0,
      height: parseDimension(values.height) ?? 0,
    }),
    [values],
  )

  function setField(key: TrailerField, value: string) {
    setLocked(false)
    setValues((current) => ({ ...current, [key]: value }))
    if (touched[key]) {
      const next = { ...values, [key]: value }
      setErrors(validateTrailer(next, units))
    }
  }

  function blurField(key: TrailerField) {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors(validateTrailer(values, units))
  }

  function switchUnits(next: UnitSystem) {
    setUnits(next)
    setLocked(false)
    setErrors(validateTrailer(values, next))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateTrailer(values, units)
    setTouched({ length: true, width: true, height: true, maxWeight: true })
    setErrors(nextErrors)
    setLocked(Object.keys(nextErrors).length === 0)
  }

  return (
    <motion.section
      className="section dims"
      id="dimensions"
      aria-labelledby="dims-title"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wrap">
       
        <h2 className="section-title" id="dims-title">
          Enter the vehicle size.
        </h2>
        <p className="section-copy">
          Length, width, and height set the available space. Payload is optional
          and helps keep the load within weight limits.
        </p>

        <div className="dims-layout">
          <form className="panel dims-panel" onSubmit={onSubmit} noValidate>
            <div className="unit-row">
              <span className="field-hint">Unit system</span>
              <div className="segmented" role="group" aria-label="Unit system">
                <button
                  type="button"
                  aria-pressed={units === 'metric'}
                  onClick={() => switchUnits('metric')}
                >
                  Metric
                </button>
                <button
                  type="button"
                  aria-pressed={units === 'imperial'}
                  onClick={() => switchUnits('imperial')}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="dims-grid">
              {FIELDS.map((field) => {
                const error = touched[field.key] ? errors[field.key] : undefined
                const parsedValue = parseDimension(values[field.key])
                const isValid =
                  Boolean(touched[field.key]) && !error && parsedValue !== null
                const limit = limits[field.key]
                const inputId = `dim-${field.key}`
                const errorId = `${inputId}-error`
                return (
                  <div className="field" key={field.key}>
                    <label htmlFor={inputId}>
                      {field.label}
                      {field.optional ? ' (optional)' : ''}
                    </label>
                    <div className="input-suffix">
                      <input
                        id={inputId}
                        className={`field-input${error ? ' is-invalid' : ''}${isValid ? ' is-valid' : ''}`}
                        inputMode="decimal"
                        type="text"
                        name={field.key}
                        value={values[field.key]}
                        onChange={(event) => setField(field.key, event.target.value)}
                        onBlur={() => blurField(field.key)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : undefined}
                        placeholder={`${limit.min}–${limit.max}`}
                      />
                      <span className="suffix">{limit.unit}</span>
                    </div>
                    <p className="field-error" id={errorId} role={error ? 'alert' : undefined}>
                      {error ?? ''}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="dims-actions">
              <button className="btn btn-primary" type="submit">
                Lock specifications
              </button>
              <AnimatePresence mode="wait">
                {locked ? (
                  <motion.p
                    key="ok"
                    className="status-ok"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Dimensions saved on this device.
                  </motion.p>
                ) : volume ? (
                  <motion.p
                    key="vol"
                    className="status-info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Volume {volume}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </form>

          <aside className="panel preview-panel" aria-label="Trailer preview">
            <div className="preview-meta">
              <span>Preview</span>
              <span>{units === 'metric' ? 'Meters' : 'Feet'}</span>
            </div>
            <TrailerPreview
              length={parsed.length}
              width={parsed.width}
              height={parsed.height}
              units={units}
            />
            <div className="preview-stats">
              <div className="stat">
                <span>Cubic volume</span>
                <strong>{volume ?? '—'}</strong>
              </div>
              <div className="stat">
                <span>Payload cap</span>
                <strong>
                  {values.maxWeight.trim()
                    ? `${values.maxWeight} ${limits.maxWeight.unit}`
                    : 'Not set'}
                </strong>
              </div>
            </div>
          </aside>
       
        
        </div>
           
        <BolUpload />
        <div className='buttonfinal'>
        <a href="#finalpage" className="btn btn-primary final" >Get result</a>
        </div>
      </div>
    </motion.section>
  )
}
