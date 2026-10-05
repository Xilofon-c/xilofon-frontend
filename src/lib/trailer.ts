import type { TrailerDimensions, TrailerSpec, UnitSystem } from '../types'
import { DEFAULT_TRAILER } from './cargo'
import { parseDimension } from './format'
import { validateTrailer } from './validate'

const M_PER_FT = 0.3048
const KG_PER_LB = 0.45359237

export const DEFAULT_TRAILER_SPEC: TrailerSpec = { ...DEFAULT_TRAILER, maxWeightKg: null, units: 'metric' }

function round(value: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Returns null while any field is missing or out of range. */
export function specFromForm(values: TrailerDimensions, units: UnitSystem): TrailerSpec | null {
  if (Object.keys(validateTrailer(values, units)).length > 0) return null
  const toM = units === 'metric' ? 1 : M_PER_FT
  const toKg = units === 'metric' ? 1 : KG_PER_LB
  const weight = parseDimension(values.maxWeight)
  return {
    length: (parseDimension(values.length) ?? 0) * toM,
    width: (parseDimension(values.width) ?? 0) * toM,
    height: (parseDimension(values.height) ?? 0) * toM,
    maxWeightKg: weight === null ? null : weight * toKg,
    units,
  }
}

/** Form values for a spec, in the units the user entered it. */
export function formFromSpec(spec: TrailerSpec): TrailerDimensions {
  const fromM = spec.units === 'metric' ? 1 : 1 / M_PER_FT
  const fromKg = spec.units === 'metric' ? 1 : 1 / KG_PER_LB
  return {
    length: String(round(spec.length * fromM, 2)),
    width: String(round(spec.width * fromM, 2)),
    height: String(round(spec.height * fromM, 2)),
    maxWeight: spec.maxWeightKg === null ? '' : String(Math.round(spec.maxWeightKg * fromKg)),
  }
}

export function formatTrailer(spec: TrailerSpec) {
  const values = formFromSpec(spec)
  const unit = spec.units === 'metric' ? 'm' : 'ft'
  return `${values.length} × ${values.width} × ${values.height} ${unit}`
}

export function formatPayload(spec: TrailerSpec) {
  if (spec.maxWeightKg === null) return null
  const unit = spec.units === 'metric' ? 'kg' : 'lb'
  return `${Number(formFromSpec(spec).maxWeight).toLocaleString()} ${unit}`
}

/** Router state that /shipments/new reads to preset its trailer. */
export type NewShipmentState = { trailer?: TrailerSpec }
