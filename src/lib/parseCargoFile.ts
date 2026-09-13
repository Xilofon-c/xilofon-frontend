import { createCargoItem } from './cargo'
import { parseXlsxRows } from './xlsx'
import type { CargoItem } from '../types'

type CargoColumn = 'name' | 'length' | 'width' | 'height' | 'weight' | 'fragile' | 'tiltable' | 'stackable' | 'quantity'

const HEADER_ALIASES: Record<string, CargoColumn> = {
  name: 'name',
  item: 'name',
  sku: 'name',
  product: 'name',
  description: 'name',
  cargo: 'name',
  object: 'name',
  title: 'name',
  length: 'length',
  l: 'length',
  len: 'length',
  length_cm: 'length',
  lengthcm: 'length',
  width: 'width',
  w: 'width',
  width_cm: 'width',
  widthcm: 'width',
  height: 'height',
  h: 'height',
  height_cm: 'height',
  heightcm: 'height',
  weight: 'weight',
  wt: 'weight',
  mass: 'weight',
  kg: 'weight',
  weight_kg: 'weight',
  weightkg: 'weight',
  fragile: 'fragile',
  tiltable: 'tiltable',
  tilt: 'tiltable',
  stackable: 'stackable',
  stack: 'stackable',
  qty: 'quantity',
  quantity: 'quantity',
  count: 'quantity',
  pcs: 'quantity',
}

function extensionOf(name: string) {
  const parts = name.toLowerCase().split('.')
  return parts.length > 1 ? parts.at(-1)! : ''
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function detectDelimiter(line: string): ',' | ';' | '\t' {
  const comma = (line.match(/,/g) ?? []).length
  const semi = (line.match(/;/g) ?? []).length
  const tab = (line.match(/\t/g) ?? []).length
  if (tab >= comma && tab >= semi && tab > 0) return '\t'
  if (semi > comma) return ';'
  return ','
}

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '')
  const firstLine = source.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = detectDelimiter(firstLine)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  const pushCell = () => {
    row.push(cell.trim())
    cell = ''
  }
  const pushRow = () => {
    if (row.some((value) => value !== '')) rows.push(row)
    row = []
  }

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"'
        index += 1
        continue
      }
      if (char === '"') {
        quoted = false
        continue
      }
      cell += char
      continue
    }
    if (char === '"') {
      quoted = true
      continue
    }
    if (char === delimiter) {
      pushCell()
      continue
    }
    if (char === '\n') {
      pushCell()
      pushRow()
      continue
    }
    if (char === '\r') continue
    cell += char
  }
  pushCell()
  pushRow()
  return rows
}

function looksLikeHeader(row: string[]) {
  return row.some((cell) => HEADER_ALIASES[normalizeHeader(cell)])
}

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'y' || normalized === 'x'
}

function rowToItem(values: Partial<Record<CargoColumn, string>>, index: number): CargoItem[] {
  const name = values.name?.trim() || `Object ${index + 1}`
  const quantity = Math.max(1, Math.min(99, Number.parseInt(values.quantity ?? '1', 10) || 1))
  const base = {
    name,
    length: values.length?.trim() ?? '',
    width: values.width?.trim() ?? '',
    height: values.height?.trim() ?? '',
    weight: values.weight?.trim() ?? '',
    fragile: parseBoolean(values.fragile ?? ''),
    tiltable: parseBoolean(values.tiltable ?? ''),
    stackable: values.stackable === undefined || values.stackable.trim() === '' ? true : parseBoolean(values.stackable),
  }
  return Array.from({ length: quantity }, (_, copy) =>
    createCargoItem({
      ...base,
      name: quantity > 1 ? `${name} ${copy + 1}` : name,
    }),
  )
}

export function rowsToCargo(rows: string[][]): CargoItem[] {
  if (rows.length === 0) return []
  const headerRow = looksLikeHeader(rows[0] ?? []) ? rows[0] : null
  const body = headerRow ? rows.slice(1) : rows
  const columns: Array<CargoColumn | null> = headerRow
    ? headerRow.map((cell) => HEADER_ALIASES[normalizeHeader(cell)] ?? null)
    : ['name', 'length', 'width', 'height', 'weight', 'fragile', 'tiltable', 'stackable', 'quantity']

  const items: CargoItem[] = []
  body.forEach((row, index) => {
    const values: Partial<Record<CargoColumn, string>> = {}
    row.forEach((cell, cellIndex) => {
      const column = columns[cellIndex]
      if (!column) return
      values[column] = cell
    })
    const hasContent = Object.values(values).some((value) => (value ?? '').trim() !== '')
    if (!hasContent) return
    items.push(...rowToItem(values, items.length + index))
  })
  return items
}

export async function parseCargoFile(file: File): Promise<CargoItem[]> {
  const ext = extensionOf(file.name)
  if (ext === 'csv' || ext === 'txt' || ext === 'tsv') {
    const items = rowsToCargo(parseCsv(await file.text()))
    if (items.length === 0) throw new Error('No cargo rows found in that file.')
    return items
  }
  if (ext === 'xlsx') {
    const items = rowsToCargo(await parseXlsxRows(file))
    if (items.length === 0) throw new Error('No cargo rows found in that spreadsheet.')
    return items
  }
  throw new Error('LOCAL_PARSE_UNSUPPORTED')
}
