/** Compact percentage bar for table cells. Turns amber above 90 %. */
export function UsageMeter({ value, label }: { value: number; label: string }) {
  const high = value > 90
  return (
    <div className="flex items-center justify-end gap-2.5" title={`${label}: ${value}%`}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-canvas-sunken" aria-hidden="true">
        <span
          className={`block h-full rounded-full ${high ? 'bg-warn' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </span>
      <span className="w-9 text-right tabular-nums">{value}%</span>
    </div>
  )
}
