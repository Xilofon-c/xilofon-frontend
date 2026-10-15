import { isAxiosError } from 'axios'
import { colorFor, createCargoItem } from './cargo'
import { api, apiError } from './apiClient'
import { parseDimension } from './format'
import type { CargoItem, CargoPlacement, TrailerInterior } from '../types'

type BolResponse = {
  truck: {
    name: string
    width: number
    length: number
    height: number
    max_weight: number
  }
  boxes: Array<{
    name: string
    width: number
    length: number
    height: number
    weight: number
    quantity: number
    stackable: boolean
    tiltable: boolean
    fragile: boolean
  }>
}

function filenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback
  const starred = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(header)
  if (starred?.[1]) {
    try {
      return decodeURIComponent(starred[1].trim().replace(/^"(.*)"$/, '$1'))
    } catch {
      return starred[1].trim()
    }
  }
  const plain = /filename="?([^"]+)"?/i.exec(header)
  return plain?.[1]?.trim() || fallback
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function detailMessage(detail: unknown, status: number) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: Array<string | number> }
    const where = first.loc?.slice(1).join('.')
    return where ? `${where}: ${first.msg ?? 'invalid value'}` : (first.msg ?? 'Invalid cargo data.')
  }
  return `Could not generate the BOL (${status}).`
}

async function bolErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Could not generate the BOL.'
  }
  if (!error.response) return 'The BOL service is unreachable. Confirm the backend is running.'

  const { status, data } = error.response
  const raw = data instanceof Blob ? (await data.text()).trim() : ''
  if (!raw) return detailMessage((data as { detail?: unknown } | undefined)?.detail, status)
  if (raw.startsWith('<!') || raw.startsWith('<html')) {
    return 'The BOL service is unreachable. Confirm the backend is running.'
  }
  try {
    const body = JSON.parse(raw) as { detail?: unknown; message?: string; error?: string }
    if (body.detail !== undefined) return detailMessage(body.detail, status)
    return body.message ?? body.error ?? `Could not generate the BOL (${status}).`
  } catch {
    return raw.slice(0, 180)
  }
}

type BolRequest = {
  shipmentId: string
  trailer: { lengthM: number; widthM: number; heightM: number }
  items: Array<{
    id: string
    name: string
    lengthCm: number
    widthCm: number
    heightCm: number
    weightKg: number
    fragile: boolean
    tiltable: boolean
    stackable: boolean
  }>
  /** Optional: the layout shown on screen (cm). Without it the server runs the packing engine itself. */
  layout?: Array<{
    id: string
    xCm: number
    yCm: number
    zCm: number
    lengthCm: number
    widthCm: number
    heightCm: number
    color: string
  }>
}

export function buildBolRequest(
  items: CargoItem[],
  trailer: TrailerInterior,
  shipmentId: string,
  placements: Map<string, CargoPlacement> | null = null,
): BolRequest {
  const request: BolRequest = {
    shipmentId,
    trailer: { lengthM: trailer.length, widthM: trailer.width, heightM: trailer.height },
    items: items.map((item) => ({
      id: item.id,
      name: item.name.trim() || 'Cargo',
      lengthCm: parseDimension(item.length) ?? 0,
      widthCm: parseDimension(item.width) ?? 0,
      heightCm: parseDimension(item.height) ?? 0,
      weightKg: parseDimension(item.weight) ?? 0,
      fragile: item.fragile,
      tiltable: item.tiltable,
      stackable: item.stackable,
    })),
  }
  if (placements) {
    // Placements are in metres; the server wants centimetres.
    request.layout = items.flatMap((item) => {
      const p = placements.get(item.id)
      if (!p) return [] // did not fit -> server lists it under "Not loaded"
      return [{
        id: item.id,
        xCm: p.x * 100,
        yCm: p.y * 100,
        zCm: p.z * 100,
        lengthCm: p.length * 100,
        widthCm: p.width * 100,
        heightCm: p.height * 100,
        color: colorFor(item),
      }]
    })
  }
  return request
}

/** Sends the shipment to the export service and downloads the BOL PDF. */
export async function generateBolPdf(request: BolRequest, shipmentId: string) {
  let response
  try {
    // The export service is mounted at /export; its router path is /shipments/bol.
    response = await api.post<Blob>('/export/shipments/bol', request, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
  } catch (error) {
    throw new Error(await bolErrorMessage(error))
  }

  const type = `${response.headers['content-type'] ?? ''} ${response.data.type}`
  if (type.includes('application/json') || type.includes('text/html')) {
    throw new Error('The server did not return a PDF.')
  }

  const disposition = response.headers['content-disposition']
  const filename = filenameFromDisposition(
    typeof disposition === 'string' ? disposition : null,
    `BOL-${shipmentId}.pdf`,
  )
  downloadBlob(response.data, filename)
  return filename
}

export async function importBol(file: File): Promise<CargoItem[]> {
  const form = new FormData()
  form.append('file', file)

  let data: BolResponse

  try {
    const response = await api.post<BolResponse>('/data/import/bol', form)
    data = response.data
  } catch (error) {
    throw new Error(apiError(error, 'Could not import the BOL file.'))
  }

  if (!data.boxes?.length) {
    throw new Error('The BOL did not contain any cargo items.')
  }

  const items = data.boxes.flatMap((box, index) => {
    const quantity = Math.max(1, box.quantity || 1)

    return Array.from({ length: quantity }, (_, copy) =>
      createCargoItem({
        name: quantity > 1 ? `${box.name} ${copy + 1}` : box.name || `Item ${index + 1}`,
        length: String(box.length),
        width: String(box.width),
        height: String(box.height),
        weight: String(box.weight),
        fragile: box.fragile,
        tiltable: box.tiltable,
        stackable: box.stackable,
      }),
    )
  })

  return items
}
