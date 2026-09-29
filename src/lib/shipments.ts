export type ShipmentStatus = 'Completed' | 'Loading' | 'Draft'

export type Shipment = {
  id: string
  vehicle: string
  destination: string
  stops: number
  boxes: number
  /** Share of trailer volume used, 0–100. */
  volume: number
  /** Share of payload capacity used, 0–100. */
  weight: number
  status: ShipmentStatus
  date: string
}

/** Placeholder history until the shipments endpoint exists. */
export const SHIPMENTS: Shipment[] = [
  { id: 'TRK-8923', vehicle: 'Sprinter van', destination: 'Cluj-Napoca', stops: 1, boxes: 18, volume: 45, weight: 30, status: 'Draft', date: '2026-05-15' },
  { id: 'TRK-8922', vehicle: 'Container 40 ft', destination: 'Constanța', stops: 3, boxes: 142, volume: 88, weight: 95, status: 'Loading', date: '2026-05-15' },
  { id: 'TRK-8921', vehicle: 'Truck 24 t', destination: 'Timișoara', stops: 2, boxes: 96, volume: 96, weight: 82, status: 'Completed', date: '2026-05-14' },
  { id: 'TRK-8917', vehicle: 'Truck 24 t', destination: 'Iași', stops: 4, boxes: 120, volume: 91, weight: 77, status: 'Completed', date: '2026-05-12' },
  { id: 'TRK-8910', vehicle: 'Trailer 13.6 m', destination: 'Brașov', stops: 1, boxes: 64, volume: 73, weight: 58, status: 'Completed', date: '2026-05-10' },
]

export const SHIPMENT_STATUSES: ShipmentStatus[] = ['Loading', 'Draft', 'Completed']
