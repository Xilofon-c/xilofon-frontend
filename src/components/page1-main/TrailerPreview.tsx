import type { UnitSystem } from '../types'

type Props = {
  length: number
  width: number
  height: number
  units: UnitSystem
}

const MAX = { length: 20, width: 4, height: 5 }

function scale(value: number, max: number, fallback: number) {
  if (value <= 0) return fallback
  return Math.min(1, value / max)
}

export function TrailerPreview({ length, width, height, units }: Props) {
  const maxL = units === 'metric' ? MAX.length : 65
  const maxW = units === 'metric' ? MAX.width : 14
  const maxH = units === 'metric' ? MAX.height : 16

  const l = 160 + scale(length, maxL, 0.7) * 180
  const w = 70 + scale(width, maxW, 0.55) * 70
  const h = 70 + scale(height, maxH, 0.55) * 80

  const originX = 70
  const originY = 210
  const depth = w * 0.55

  const floor = {
    a: `${originX},${originY}`,
    b: `${originX + l},${originY}`,
    c: `${originX + l + depth},${originY - depth * 0.5}`,
    d: `${originX + depth},${originY - depth * 0.5}`,
  }
  const roof = {
    a: `${originX},${originY - h}`,
    b: `${originX + l},${originY - h}`,
    c: `${originX + l + depth},${originY - h - depth * 0.5}`,
    d: `${originX + depth},${originY - h - depth * 0.5}`,
  }

  const dimLabel = (value: number, unit: string) =>
    value > 0 ? `${value.toFixed(1)} ${unit}` : '—'

  const unit = units === 'metric' ? 'm' : 'ft'
  const stroke = '#5c0771'
  const strokeSoft = '#bb99c2'
  const label = '#71717a'

  return (
    <svg className="preview-svg" viewBox="0 0 480 280" role="img" aria-label="Trailer size preview">
      <defs>
        <linearGradient id="bay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3ecfd" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>
      <polygon
        points={`${floor.a} ${floor.b} ${floor.c} ${floor.d}`}
        fill="url(#bay)"
        stroke={strokeSoft}
        strokeWidth="1.4"
      />
      <polygon
        points={`${roof.a} ${roof.b} ${roof.c} ${roof.d}`}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
      />
      <line x1={originX} y1={originY} x2={originX} y2={originY - h} stroke={stroke} />
      <line x1={originX + l} y1={originY} x2={originX + l} y2={originY - h} stroke={stroke} />
      <line
        x1={originX + l + depth}
        y1={originY - depth * 0.5}
        x2={originX + l + depth}
        y2={originY - h - depth * 0.5}
        stroke={strokeSoft}
      />
      <line
        x1={originX + depth}
        y1={originY - depth * 0.5}
        x2={originX + depth}
        y2={originY - h - depth * 0.5}
        stroke={strokeSoft}
      />
      <text x={originX + l / 2} y={originY + 22} fill={label} fontSize="12" textAnchor="middle" fontFamily="DM Sans, system-ui, sans-serif">
        L {dimLabel(length, unit)}
      </text>
      <text x={originX + l + depth + 18} y={originY - h / 2} fill={label} fontSize="12" fontFamily="DM Sans, system-ui, sans-serif">
        H {dimLabel(height, unit)}
      </text>
      <text x={originX + l + depth / 2 + 8} y={originY - depth * 0.5 + 18} fill={label} fontSize="12" fontFamily="DM Sans, system-ui, sans-serif">
        W {dimLabel(width, unit)}
      </text>
    </svg>
  )
}
