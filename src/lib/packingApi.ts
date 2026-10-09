import { isAxiosError } from 'axios'
import { api } from './apiClient'
import { DEFAULT_TRAILER } from './cargo'
import { parseDimension } from './format'
import type { CargoItem, CargoPlacement, TrailerInterior } from '../types'

export const DEFAULT_TRAILER_MAX_WEIGHT_KG = 24_000

/**
 * The packing engine is unit-agnostic; we send centimetres. Its axes differ from the viewport's:
 * x runs across the trailer width, y along its length, z is vertical.
 */
type CalculateLoadRequest = {
  truck: { name: string; width: number; length: number; height: number; max_weight: number }
  boxes: Array<{
    name: string
    width: number
    length: number
    height: number
    weight: number
    quantity: number
    fragile: boolean
    tiltable: boolean
    stackable: boolean
    priority: number
  }>
}

type PlacedItem = {
  id: string
  /** Echoes the request box name with a `_<copy index>` suffix. */
  name: string
  length: string
  width: string
  height: string
  weight: string
  fragile: boolean
  tiltable: boolean
  stackable: boolean
  x: number
  y: number
  z: number
  color: string
}

type CalculateLoadResponse = {
  placed?: Array<{ item: PlacedItem }>
}

function mToCm(value: number) {
  return Math.round(value * 1000) / 10
}

function errorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Could not calculate the load.'
  }
  if (!error.response) {
    return 'The packing service is unreachable. Confirm the backend is running.'
  }
  const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: Array<string | number> }
    const where = first.loc?.slice(1).join('.')
    return where ? `${where}: ${first.msg ?? 'invalid value'}` : (first.msg ?? 'Invalid cargo data.')
  }
  return `Load calculation failed (${error.response.status})`
}

/** Returns placements keyed by cargo item id; items missing from the map did not fit. */
export async function calculateLoad(
  items: CargoItem[],
  trailer: TrailerInterior = DEFAULT_TRAILER,
  maxWeightKg: number | null = null,
): Promise<Map<string, CargoPlacement>> {
  const payload: CalculateLoadRequest = {
    truck: {
      name: 'trailer',
      width: mToCm(trailer.width),
      length: mToCm(trailer.length),
      height: mToCm(trailer.height),
      max_weight: maxWeightKg ?? DEFAULT_TRAILER_MAX_WEIGHT_KG,
    },
    boxes: items.map((item, index) => ({
      name: item.id,
      width: parseDimension(item.width) ?? 0,
      length: parseDimension(item.length) ?? 0,
      height: parseDimension(item.height) ?? 0,
      weight: parseDimension(item.weight) ?? 0,
      quantity: 1,
      fragile: item.fragile,
      tiltable: item.tiltable,
      stackable: item.stackable,
      // List order is load priority: the first box is packed before the ones below it.
      priority: items.length - index,
    })),
  }

  let data: CalculateLoadResponse
  try {
    ;({ data } = await api.post<CalculateLoadResponse>('/packing/calculate-load', payload))
  } catch (error) {
    throw new Error(errorMessage(error))
  }

  const ids = new Set(items.map((item) => item.id))
  const placements = new Map<string, CargoPlacement>()
  for (const { item: placed } of data.placed ?? []) {
    const id = placed.name.replace(/_\d+$/, '')
    if (!ids.has(id)) continue
    placements.set(id, {
      x: placed.y / 100,
      y: placed.z / 100,
      z: placed.x / 100,
      length: Number(placed.length) / 100,
      width: Number(placed.width) / 100,
      height: Number(placed.height) / 100,
    })
  }
  return placements
}
