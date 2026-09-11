import type { CargoItem, PackedBox, TrailerInterior } from '../types'
import { parseDimension } from './format'

export const DEFAULT_TRAILER: TrailerInterior = {
  length: 13.6,
  width: 2.45,
  height: 2.7,
}

export const DECK_HEIGHT = 1.18

const GAP = 0.04
const PALETTE = ['#7e3aa0', '#5c0771', '#81468d', '#6b3fa0', '#4a2060']

export function newShipmentId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomUUID().slice(0, 4).toUpperCase()
  return `XLF-${stamp}-${rand}`
}

export function createCargoItem(partial: Partial<CargoItem> = {}): CargoItem {
  return {
    id: crypto.randomUUID(),
    name: 'Box',
    length: '80',
    width: '60',
    height: '50',
    weight: '10',
    fragile: false,
    tiltable: false,
    stackable: true,
    ...partial,
  }
}

export function cmToM(value: string): number | null {
  const parsed = parseDimension(value)
  if (parsed === null || parsed <= 0) return null
  return parsed / 100
}

export function colorFor(item: CargoItem): string {
  if (item.fragile) return '#c2410c'
  if (!item.stackable) return '#4338ca'
  if (item.tiltable) return '#0369a1'
  let hash = 0
  for (const ch of item.id) hash = (hash + ch.charCodeAt(0)) % PALETTE.length
  return PALETTE[hash] ?? PALETTE[0]
}

export function cargoHasDimensions(item: CargoItem) {
  return cmToM(item.length) !== null && cmToM(item.width) !== null && cmToM(item.height) !== null
}

function uniqueTriples(values: Array<[number, number, number]>) {
  const seen = new Set<string>()
  const out: Array<[number, number, number]> = []
  for (const triple of values) {
    const key = triple.map((n) => n.toFixed(4)).join('x')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(triple)
  }
  return out
}

function rotations(item: CargoItem): Array<[number, number, number]> {
  const length = cmToM(item.length)
  const width = cmToM(item.width)
  const height = cmToM(item.height)
  if (length === null || width === null || height === null) return []

  if (item.tiltable) {
    return uniqueTriples([
      [length, width, height],
      [length, height, width],
      [width, length, height],
      [width, height, length],
      [height, length, width],
      [height, width, length],
    ])
  }

  return uniqueTriples([
    [length, width, height],
    [width, length, height],
  ])
}

function overlaps(a: PackedBox, b: PackedBox) {
  return (
    a.x < b.x + b.length - 0.001 &&
    a.x + a.length > b.x + 0.001 &&
    a.y < b.y + b.height - 0.001 &&
    a.y + a.height > b.y + 0.001 &&
    a.z < b.z + b.width - 0.001 &&
    a.z + a.width > b.z + 0.001
  )
}

function fits(box: PackedBox, occupied: PackedBox[], trailer: TrailerInterior) {
  if (box.x < GAP || box.y < -0.001 || box.z < GAP) return false
  if (box.x + box.length > trailer.length - GAP) return false
  if (box.z + box.width > trailer.width - GAP) return false
  if (box.y + box.height > trailer.height - GAP) return false
  return !occupied.some((other) => other.fitted && overlaps(box, other))
}

function makeBox(
  item: CargoItem,
  x: number,
  y: number,
  z: number,
  length: number,
  width: number,
  height: number,
  fitted: boolean,
): PackedBox {
  return {
    item,
    x,
    y,
    z,
    length,
    width,
    height,
    fitted,
    color: colorFor(item),
  }
}

export function packCargo(
  items: CargoItem[],
  trailer: TrailerInterior = DEFAULT_TRAILER,
): PackedBox[] {
  const packed: PackedBox[] = []
  const leftover: CargoItem[] = []

  let bayX = GAP
  let bayZ = GAP
  let rowDepth = 0

  function usableRotations(item: CargoItem) {
    return rotations(item).filter(
      ([length, width, height]) =>
        length <= trailer.length - 2 * GAP &&
        width <= trailer.width - 2 * GAP &&
        height <= trailer.height - GAP,
    )
  }

  function placeOnFloor(item: CargoItem) {
    const variants = usableRotations(item)
    if (variants.length === 0) return false

    for (let attempt = 0; attempt < 3; attempt += 1) {
      for (const [length, width, height] of variants) {
        if (bayZ + width > trailer.width - GAP) {
          bayZ = GAP
          bayX += rowDepth + GAP
          rowDepth = 0
        }
        const box = makeBox(item, bayX, 0, bayZ, length, width, height, true)
        if (!fits(box, packed, trailer)) continue
        packed.push(box)
        bayZ += width + GAP
        rowDepth = Math.max(rowDepth, length)
        return true
      }
      bayZ = GAP
      bayX += rowDepth + GAP
      rowDepth = 0
    }
    return false
  }

  function placeOnStack(item: CargoItem) {
    const variants = usableRotations(item)
    for (const support of packed) {
      if (!support.fitted || !support.item.stackable || support.item.fragile) continue
      for (const [length, width, height] of variants) {
        if (length > support.length + 0.01 || width > support.width + 0.01) continue
        const box = makeBox(
          item,
          support.x,
          support.y + support.height + GAP,
          support.z,
          length,
          width,
          height,
          true,
        )
        if (!fits(box, packed, trailer)) continue
        packed.push(box)
        return true
      }
    }
    return false
  }

  for (const item of items) {
    if (rotations(item).length === 0) continue
    if (placeOnFloor(item)) continue
    leftover.push(item)
  }

  const stillOpen: CargoItem[] = []
  for (const item of leftover) {
    if (placeOnStack(item)) continue
    stillOpen.push(item)
  }

  let parkZ = trailer.width + 0.55
  for (const item of stillOpen) {
    const length = cmToM(item.length) ?? 0.5
    const width = cmToM(item.width) ?? 0.4
    const height = cmToM(item.height) ?? 0.4
    packed.push(makeBox(item, trailer.length + 1.25, 0, parkZ, length, width, height, false))
    parkZ += width + GAP
  }

  return packed
}

export function cargoStats(
  items: CargoItem[],
  packed: PackedBox[],
  trailer: TrailerInterior = DEFAULT_TRAILER,
) {
  const volume = trailer.length * trailer.width * trailer.height
  const fitted = packed.filter((box) => box.fitted)
  const used = fitted.reduce((sum, box) => sum + box.length * box.width * box.height, 0)
  const weight = items.reduce((sum, item) => sum + (parseDimension(item.weight) ?? 0), 0)
  return {
    count: items.length,
    fitted: fitted.length,
    overflow: packed.length - fitted.length,
    weight,
    fillPercent: volume > 0 ? Math.min(100, (used / volume) * 100) : 0,
  }
}
