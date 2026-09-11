import type { TrailerDimensions, UnitSystem } from '../types'

export const METRIC_LIMITS = {
  length: { min: 1, max: 20, unit: 'm' },
  width: { min: 1, max: 4, unit: 'm' },
  height: { min: 1, max: 5, unit: 'm' },
  maxWeight: { min: 1, max: 50_000, unit: 'kg' },
} as const

export const IMPERIAL_LIMITS = {
  length: { min: 4, max: 65, unit: 'ft' },
  width: { min: 4, max: 14, unit: 'ft' },
  height: { min: 4, max: 16, unit: 'ft' },
  maxWeight: { min: 1, max: 110_000, unit: 'lb' },
} as const

export function limitsFor(units: UnitSystem) {
  return units === 'metric' ? METRIC_LIMITS : IMPERIAL_LIMITS
}

export function parseDimension(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function cubicVolume(
  dims: TrailerDimensions,
  units: UnitSystem,
): string | null {
  const length = parseDimension(dims.length)
  const width = parseDimension(dims.width)
  const height = parseDimension(dims.height)
  if (length === null || width === null || height === null) return null
  if (length <= 0 || width <= 0 || height <= 0) return null
  const volume = length * width * height
  const unit = units === 'metric' ? 'm³' : 'ft³'
  return `${volume.toFixed(1)} ${unit}`
}
