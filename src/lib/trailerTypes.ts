import type { TrailerSpec } from '../types'
import { DEFAULT_TRAILER } from './cargo'
import { Container, Trailer, Truck } from 'lucide-react'

/**
 * Measured cargo box of a GLB after its baked Y-up transform.
 * Length runs along −Z (cab toward +Z), width along X, wheels sit near groundY.
 */
export type TrailerModel = {
  url: string
  cargoZFront: number
  cargoLength: number
  centerX: number
  groundY: number
  floorY: number
}

/** Low Poly Truck by FS 3D Studio, CC-BY-4.0 — https://sketchfab.com/3d-models/low-poly-truck-d61a2ac0a706462ebf82459907f21573 */
const LONG_TRUCK: TrailerModel = {
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
  /** Until a type has its own GLB, it reuses the long truck, scaled to its length. */
  model: TrailerModel

}

export const TRAILER_TYPES: TrailerType[] = [
  { id: 'long-truck', label: 'Long truck', spec: { ...DEFAULT_TRAILER, maxWeightKg: 24_000 }, model: LONG_TRUCK },
  { id: 'curtainsider', label: 'Curtainsider 13.6 m', spec: { length: 13.6, width: 2.45, height: 2.7, maxWeightKg: 24_000 }, model: LONG_TRUCK },
  { id: 'mega', label: 'Mega trailer', spec: { length: 13.6, width: 2.48, height: 3.0, maxWeightKg: 24_000 }, model: LONG_TRUCK },
  { id: 'reefer', label: 'Refrigerated trailer', spec: { length: 13.3, width: 2.46, height: 2.6, maxWeightKg: 22_000 }, model: LONG_TRUCK },
  { id: 'container-40', label: 'Container 40 ft', spec: { length: 12.03, width: 2.35, height: 2.39, maxWeightKg: 26_500 }, model: LONG_TRUCK },
  { id: 'container-20', label: 'Container 20 ft', spec: { length: 5.9, width: 2.35, height: 2.39, maxWeightKg: 28_000 }, model: LONG_TRUCK },
  { id: 'box-truck', label: 'Box truck 7.5 t', spec: { length: 6.2, width: 2.45, height: 2.4, maxWeightKg: 3_000 }, model: LONG_TRUCK },
]

export const DEFAULT_TRAILER_TYPE = TRAILER_TYPES[0]

export function trailerTypeById(id: string) {
  return TRAILER_TYPES.find((type) => type.id === id) ?? DEFAULT_TRAILER_TYPE
}

/** True when the spec still has the preset size of the type. */
export function hasPresetSize(type: TrailerType, spec: TrailerSpec) {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005
  return near(type.spec.length, spec.length) && near(type.spec.width, spec.width) && near(type.spec.height, spec.height)
}

/** The type whose size matches the spec, so a size from the Home page selects its type. */
export function typeForSpec(spec: TrailerSpec) {
  return TRAILER_TYPES.find((type) => hasPresetSize(type, spec)) ?? DEFAULT_TRAILER_TYPE
}
