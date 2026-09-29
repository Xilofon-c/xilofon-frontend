import { useState } from 'react'
import type { FieldErrors, TrailerDimensions, TrailerField, TrailerSpec, UnitSystem } from '../types'
import { formFromSpec, specFromForm } from '../lib/trailer'
import { validateTrailer } from '../lib/validate'

const EMPTY: TrailerDimensions = { length: '', width: '', height: '', maxWeight: '' }
const ALL_TOUCHED = { length: true, width: true, height: true, maxWeight: true }

export type TrailerForm = ReturnType<typeof useTrailerForm>

/** Form state for trailer dimensions, shared by the dashboard and the cargo workspace. */
export function useTrailerForm(initial?: TrailerSpec) {
  const [units, setUnits] = useState<UnitSystem>(initial?.units ?? 'metric')
  const [values, setValues] = useState<TrailerDimensions>(() => (initial ? formFromSpec(initial) : EMPTY))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<TrailerField, boolean>>>({})

  const isEmpty = Object.values(values).every((value) => value.trim() === '')

  function setField(key: TrailerField, value: string) {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched[key]) setErrors(validateTrailer(next, units))
  }

  function blurField(key: TrailerField) {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors(validateTrailer(values, units))
  }

  function switchUnits(next: UnitSystem) {
    setUnits(next)
    setErrors(validateTrailer(values, next))
  }

  /** Shows every error and returns the spec, or null when a field is invalid. */
  function validateAll(): TrailerSpec | null {
    setTouched(ALL_TOUCHED)
    setErrors(validateTrailer(values, units))
    return specFromForm(values, units)
  }

  function reset(spec?: TrailerSpec) {
    setUnits(spec?.units ?? 'metric')
    setValues(spec ? formFromSpec(spec) : EMPTY)
    setErrors({})
    setTouched({})
  }

  return {
    units,
    values,
    errors,
    touched,
    isEmpty,
    spec: specFromForm(values, units),
    setField,
    blurField,
    switchUnits,
    validateAll,
    reset,
  }
}
