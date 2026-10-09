import { createCargoItem } from './cargo'
import { api, apiError } from './apiClient'
import type { CargoItem } from '../types'

function apiBase() {
  return (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
}

export type BolGeneratePayload = {
  shipmentId: string
  trailer: {
    lengthM: number
    widthM: number
    heightM: number
  }
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
  // Exactly where the 3D view put each box (cm). The PDF is drawn from this, so it matches the screen.
  layout?: Array<{
    id: string
    xCm: number // along the trailer, 0 = cab end
    yCm: number // height above the floor
    zCm: number // across the trailer width
    lengthCm: number
    widthCm: number
    heightCm: number
    color: string
  }>
}

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

async function readError(response: Response) {
  const type = response.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? `Request failed (${response.status})`
  }
  const text = (await response.text()).trim()
  if (type.includes('text/html') || text.startsWith('<!')) {
    return 'The BOL service is unreachable. Confirm the backend is running.'
  }
  return text.slice(0, 180) || `Request failed (${response.status})`
}

export async function generateBolPdf(payload: BolGeneratePayload) {
  let response: Response
  try {
    response = await fetch(`${apiBase()}/shipments/bol`, {
      method: 'POST',
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('The BOL service is unreachable. Confirm the backend is running.')
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const type = response.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    throw new Error('The server did not return a PDF.')
  }

  const blob = await response.blob()
  const filename = filenameFromDisposition(
    response.headers.get('content-disposition'),
    `BOL-${payload.shipmentId}.pdf`,
  )
  downloadBlob(blob, filename)
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
