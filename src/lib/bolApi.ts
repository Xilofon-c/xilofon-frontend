import { createCargoItem } from './cargo'
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

type ExtractedRow = {
  name?: string
  length?: string | number
  width?: string | number
  height?: string | number
  weight?: string | number
  fragile?: boolean | string
  tiltable?: boolean | string
  stackable?: boolean | string
  quantity?: number | string
}

function asText(value: string | number | boolean | undefined) {
  if (value === undefined) return ''
  return String(value)
}

function asFlag(value: boolean | string | undefined, fallback: boolean) {
  if (value === undefined || value === '') return fallback
  if (typeof value === 'boolean') return value
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'y'
}

export async function extractCargoFromDocument(file: File): Promise<CargoItem[]> {
  const body = new FormData()
  body.append('file', file)

  let response: Response
  try {
    response = await fetch(`${apiBase()}/documents/extract`, {
      method: 'POST',
      body,
    })
  } catch {
    throw new Error('Could not reach the document reader. Use CSV or Excel, or start the backend.')
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const payload = (await response.json()) as { items?: ExtractedRow[] }
  const rows = payload.items ?? []
  if (rows.length === 0) {
    throw new Error('The document did not contain any cargo lines.')
  }

  return rows.flatMap((row, index) => {
    const quantity = Math.max(1, Math.min(99, Number(row.quantity ?? 1) || 1))
    const name = asText(row.name).trim() || `Object ${index + 1}`
    return Array.from({ length: quantity }, (_, copy) =>
      createCargoItem({
        name: quantity > 1 ? `${name} ${copy + 1}` : name,
        length: asText(row.length),
        width: asText(row.width),
        height: asText(row.height),
        weight: asText(row.weight),
        fragile: asFlag(row.fragile, false),
        tiltable: asFlag(row.tiltable, false),
        stackable: asFlag(row.stackable, true),
      }),
    )
  })
}
