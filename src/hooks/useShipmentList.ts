import { useEffect, useState } from 'react'
import { isAbortError, listShipments, shipmentLoadError, type ShipmentRow } from '../lib/shipments'

export function useShipmentList(enabled = true) {
  const [rows, setRows] = useState<ShipmentRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    listShipments(controller.signal)
      .then((next) => {
        setRows(next)
        setError(null)
      })
      .catch((cause) => {
        if (isAbortError(cause)) return
        setRows([])
        setError(shipmentLoadError(cause, 'Could not load shipments.'))
      })
    return () => controller.abort()
  }, [enabled])

  return { rows, error }
}
