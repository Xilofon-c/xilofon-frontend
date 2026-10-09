/** Compact percentage bar for table cells. Turns amber above 90 %. */
export function UsageMeter({ value, label }: { value: number; label: string }) {
  const high = value > 90
  const shown = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return (
    <div className="flex items-center justify-end gap-2.5" title={`${label}: ${shown}%`}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-canvas-sunken" aria-hidden="true">
        <span
          className={`block h-full rounded-full ${high ? 'bg-warn' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </span>
      <span className="min-w-9 text-right tabular-nums">{shown}%</span>
    </div>
  )
}
