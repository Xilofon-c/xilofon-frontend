import { isAxiosError } from 'axios'
import type { CargoItem, CargoPlacement, TrailerSpec } from '../types'
import { api, apiError } from './apiClient'
import { createCargoItem } from './cargo'

/**
 * A row of the shipments table.
 * `truck`, `boxes`, `plan`, and `stats` are JSON columns; the API may return them as objects or as JSON strings.
 */
export type ShipmentTruck = {
  name: string
  /** Interior size in centimetres, payload in kilograms. */
  width: number
  length: number
  height: number
  max_weight: number
}

export type ShipmentBox = {
  name: string
  width: number
  length: number
  height: number
  weight: number
  quantity: number
  stackable: boolean
  tiltable: boolean
  fragile: boolean
  priority: number
}

/** One placed copy. Axes match the packing engine: x across the width, y along the length, z up. Centimetres. */
export type PlacedCargo = {
  id: string
  name: string
  length: number
  width: number
  height: number
  weight: number
  fragile: boolean
  tiltable: boolean
  stackable: boolean
  x: number
  y: number
  z: number
}

export type ShipmentPlan = {
  placed: PlacedCargo[]
}

export type ShipmentStats = {
  requested: number
  placed: number
  unplaced: number
  weight_kg: number
  max_weight_kg: number
  weight_percent: number
  volume_percent: number
}

/** Fields the list endpoint returns. Boxes and the plan stay on the detail request. */
export type ShipmentRow = {
  id: string
  created_at: string
  created_by: string
  truck: ShipmentTruck | null
  stats: ShipmentStats
}

export type ShipmentDetail = ShipmentRow & {
  truck: ShipmentTruck
  boxes: ShipmentBox[]
  plan: ShipmentPlan
}

const EMPTY_STATS: ShipmentStats = {
  requested: 0,
  placed: 0,
  unplaced: 0,
  weight_kg: 0,
  max_weight_kg: 0,
  weight_percent: 0,
  volume_percent: 0,
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return asRecord(JSON.parse(trimmed))
    } catch {
      return null
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  return null
}

function asArray(value: unknown): unknown[] {
  if (typeof value === 'string') {
    try {
      return asArray(JSON.parse(value))
    } catch {
      return []
    }
  }
  return Array.isArray(value) ? value : []
}

function num(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function dim(value: number) {
  return String(Math.round(value * 1000) / 1000)
}

export function isAbortError(error: unknown) {
  return isAxiosError(error) && error.code === 'ERR_CANCELED'
}

export function shipmentLoadError(error: unknown, fallback: string) {
  const message = apiError(error, fallback)
  if (/not authenticated|invalid or expired token|user no longer exists/i.test(message)) {
    return 'Log in to open shipments.'
  }
  return message
}

export function formatShipmentDate(value: string) {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
  const date = new Date(hasZone ? value : `${value}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTruckSize(truck: ShipmentTruck) {
  const metres = (cm: number) => String(Math.round((cm / 100) * 100) / 100)
  return `${metres(truck.length)} × ${metres(truck.width)} × ${metres(truck.height)} m`
}

function parseTruck(value: unknown): ShipmentTruck | null {
  const row = asRecord(value)
  if (!row) return null
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  return {
    name: name || 'Trailer',
    width: num(row.width),
    length: num(row.length),
    height: num(row.height),
    max_weight: num(row.max_weight),
  }
}

function parseStats(value: unknown): ShipmentStats {
  const row = asRecord(value)
  if (!row) return EMPTY_STATS
  return {
    requested: num(row.requested),
    placed: num(row.placed),
    unplaced: num(row.unplaced),
    weight_kg: num(row.weight_kg),
    max_weight_kg: num(row.max_weight_kg),
    weight_percent: num(row.weight_percent),
    volume_percent: num(row.volume_percent),
  }
}

function parseBox(value: unknown): ShipmentBox | null {
  const row = asRecord(value)
  if (!row) return null
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  const quantity = num(row.quantity)
  return {
    name: name || 'Cargo',
    width: num(row.width),
    length: num(row.length),
    height: num(row.height),
    weight: num(row.weight),
    quantity: quantity > 0 ? Math.round(quantity) : 1,
    stackable: row.stackable !== false,
    tiltable: row.tiltable === true,
    fragile: row.fragile === true,
    priority: num(row.priority),
  }
}

function parsePlaced(value: unknown): PlacedCargo | null {
  const wrapper = asRecord(value)
  const item = asRecord(wrapper?.item ?? value)
  if (!item) return null
  const name = typeof item.name === 'string' ? item.name.trim() : ''
  if (!name) return null
  return {
    id: typeof item.id === 'string' ? item.id : '',
    name,
    length: num(item.length),
    width: num(item.width),
    height: num(item.height),
    weight: num(item.weight),
    fragile: item.fragile === true,
    tiltable: item.tiltable === true,
    stackable: item.stackable !== false,
    x: num(item.x),
    y: num(item.y),
    z: num(item.z),
  }
}

function parsePlan(value: unknown): ShipmentPlan {
  const row = asRecord(value)
  return {
    placed: asArray(row?.placed)
      .map(parsePlaced)
      .filter((item): item is PlacedCargo => item !== null),
  }
}

export function parseShipmentRow(value: unknown): ShipmentRow | null {
  const row = asRecord(value)
  if (!row || typeof row.id !== 'string' || !row.id.trim()) return null
  return {
    id: row.id.trim(),
    created_at: typeof row.created_at === 'string' ? row.created_at : '',
    created_by: typeof row.created_by === 'string' ? row.created_by : '',
    truck: parseTruck(row.truck),
    stats: parseStats(row.stats),
  }
}

export function parseShipmentDetail(value: unknown): ShipmentDetail | null {
  const row = parseShipmentRow(value)
  const record = asRecord(value)
  if (!row || !record) return null
  return {
    ...row,
    truck: row.truck ?? {
      name: 'Trailer',
      width: 245,
      length: 1360,
      height: 270,
      max_weight: 24000,
    },
    boxes: asArray(record.boxes)
      .map(parseBox)
      .filter((box): box is ShipmentBox => box !== null),
    plan: parsePlan(record.plan),
  }
}

export async function listShipments(signal?: AbortSignal) {
  const { data } = await api.get<unknown>('/export/shipments', { signal })
  if (!Array.isArray(data)) throw new Error('Could not load shipments.')
  return data.map(parseShipmentRow).filter((row): row is ShipmentRow => row !== null)
}

export async function getShipment(id: string, signal?: AbortSignal) {
  const { data } = await api.get<unknown>(`/export/shipments/${encodeURIComponent(id)}`, { signal })
  const shipment = parseShipmentDetail(data)
  if (!shipment) throw new Error('Could not read this shipment.')
  return shipment
}

function cargoFromBox(box: ShipmentBox): CargoItem {
  return createCargoItem({
    name: box.name,
    length: dim(box.length),
    width: dim(box.width),
    height: dim(box.height),
    weight: dim(box.weight),
    fragile: box.fragile,
    tiltable: box.tiltable,
    stackable: box.stackable,
  })
}

function cargoFromPlaced(placed: PlacedCargo): CargoItem {
  return createCargoItem({
    ...(placed.id ? { id: placed.id } : {}),
    name: placed.name.replace(/_\d+$/, '') || 'Cargo',
    length: dim(placed.length),
    width: dim(placed.width),
    height: dim(placed.height),
    weight: dim(placed.weight),
    fragile: placed.fragile,
    tiltable: placed.tiltable,
    stackable: placed.stackable,
  })
}

/** Packing-engine centimetres to the viewport: x along the length, y up, z across the width, in metres. */
function placementFromEngine(placed: PlacedCargo): CargoPlacement {
  return {
    x: placed.y / 100,
    y: placed.z / 100,
    z: placed.x / 100,
    length: placed.length / 100,
    width: placed.width / 100,
    height: placed.height / 100,
  }
}

function placementsFor(items: CargoItem[], plan: ShipmentPlan) {
  const idsByName = new Map<string, string[]>()
  for (const item of items) {
    const queue = idsByName.get(item.name) ?? []
    queue.push(item.id)
    idsByName.set(item.name, queue)
  }

  const placements = new Map<string, CargoPlacement>()
  for (const placed of plan.placed) {
    const baseName = placed.name.replace(/_\d+$/, '')
    const id = idsByName.get(baseName)?.shift() ?? idsByName.get(placed.name)?.shift()
    if (!id) continue
    placements.set(id, placementFromEngine(placed))
  }
  return placements
}

export function trailerFromTruck(truck: ShipmentTruck): TrailerSpec {
  return {
    length: truck.length / 100,
    width: truck.width / 100,
    height: truck.height / 100,
    maxWeightKg: truck.max_weight > 0 ? truck.max_weight : null,
    units: 'metric',
  }
}

/** Cargo objects for a saved shipment, with the stored plan applied. */
export function viewModelFromShipment(shipment: ShipmentDetail) {
  const expanded = shipment.boxes.flatMap((box) => Array.from({ length: box.quantity }, () => cargoFromBox(box)))
  const items = expanded.length > 0 ? expanded : shipment.plan.placed.map(cargoFromPlaced)
  return {
    items,
    placements: placementsFor(items, shipment.plan),
    trailer: trailerFromTruck(shipment.truck),
  }
}
