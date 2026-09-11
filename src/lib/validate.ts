import type { FieldErrors, TrailerDimensions, TrailerField, UnitSystem } from '../types'
import { limitsFor, parseDimension } from './format'

const LABELS: Record<TrailerField, string> = {
  length: 'Length',
  width: 'Width',
  height: 'Height',
  maxWeight: 'Max weight',
}

export function validateTrailer(
  values: TrailerDimensions,
  units: UnitSystem,
): FieldErrors {
  const limits = limitsFor(units)
  const errors: FieldErrors = {}
  const required: TrailerField[] = ['length', 'width', 'height']

  for (const field of required) {
    const parsed = parseDimension(values[field])
    if (parsed === null) {
      errors[field] = `${LABELS[field]} is required`
      continue
    }
    if (parsed <= 0) {
      errors[field] = `${LABELS[field]} must be greater than 0`
      continue
    }
    const { min, max, unit } = limits[field]
    if (parsed < min || parsed > max) {
      errors[field] = `Typical range is ${min}–${max} ${unit}`
    }
  }

  const weight = values.maxWeight.trim()
  if (weight !== '') {
    const parsed = parseDimension(values.maxWeight)
    if (parsed === null || parsed <= 0) {
      errors.maxWeight = 'Enter a valid payload limit'
    } else {
      const { min, max, unit } = limits.maxWeight
      if (parsed < min || parsed > max) {
        errors.maxWeight = `Typical payload is ${min.toLocaleString()}–${max.toLocaleString()} ${unit}`
      }
    }
  }

  return errors
}
