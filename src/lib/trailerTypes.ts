import type { TrailerSpec } from '../types'

/**
 * Cargo opening of a GLB after its baked Y-up transform.
 * Length runs along −Z (cab toward +Z), width along X, wheels sit near groundY.
 * The mesh is drawn at its own proportions, scaled uniformly so the opening length matches the type.
 */
export type TrailerModel = {
  url: string
  cargoZFront: number
  cargoLength: number
  centerX: number
  groundY: number
  floorY: number
}

/**
 * Stand-in until each type has its own file in public/models.
 * Replace the GLB, then remeasure these values on that file.
 */
const STAND_IN_TRUCK: TrailerModel = {
  url: '/models/long_truck1_transparent.glb',
  cargoZFront: 1.2191,
  cargoLength: 16.4197,
  centerX: 8.3057,
  groundY: 0.3494,
  floorY: 2.1073,
}

export type TrailerType = {
  id: string
  label: string
  /** Interior in metres and payload in kg. */
  spec: Omit<TrailerSpec, 'units'>
  /** Null for custom dimensions, which draw a resizable container instead of a mesh. */
  model: TrailerModel | null
}

export const CUSTOM_TRAILER_ID = 'custom'

export const TRAILER_TYPES: TrailerType[] = [
  {
    id: 'european-semi',
    label: 'European semi-trailer',
    spec: { length: 13.6, width: 2.48, height: 2.7, maxWeightKg: 24_000 },
    model: { ...STAND_IN_TRUCK, url: '/models/european-semi-trailer.glb' },
  },
  {
    id: 'european-trailer',
    label: 'European trailer',
    spec: { length: 7.45, width: 2.48, height: 2.7, maxWeightKg: 16_000 },
    model: { ...STAND_IN_TRUCK, url: '/models/european-trailer.glb' },
  },
  {
    id: 'rigid-truck',
    label: 'Truck with fixed body',
    spec: { length: 7.3, width: 2.45, height: 2.4, maxWeightKg: 9_000 },
    model: { ...STAND_IN_TRUCK, url: '/models/rigid-truck.glb' },
  },
  {
    id: CUSTOM_TRAILER_ID,
    label: 'Custom dimensions',
    spec: { length: 13.6, width: 2.48, height: 2.7, maxWeightKg: null },
    model: null,
  },
]

export const DEFAULT_TRAILER_TYPE = TRAILER_TYPES[0]
export const CUSTOM_TRAILER_TYPE = TRAILER_TYPES[TRAILER_TYPES.length - 1]

export function trailerTypeById(id: string) {
  return TRAILER_TYPES.find((type) => type.id === id) ?? DEFAULT_TRAILER_TYPE
}

/** True when the spec still has the preset size of the type. */
export function hasPresetSize(type: TrailerType, spec: TrailerSpec) {
  if (!type.model) return false
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005
  return near(type.spec.length, spec.length) && near(type.spec.width, spec.width) && near(type.spec.height, spec.height)
}

/** The type whose size matches the spec. Any other size is custom dimensions. */
export function typeForSpec(spec: TrailerSpec) {
  return TRAILER_TYPES.find((type) => hasPresetSize(type, spec)) ?? CUSTOM_TRAILER_TYPE
}
