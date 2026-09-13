import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.6 11.2 12 4.9l7.4 6.3V19a1.1 1.1 0 0 1-1.1 1.1h-4.2v-5.2H9.9V20.1H5.7A1.1 1.1 0 0 1 4.6 19v-7.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccountIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.15" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.6 18.7c1.15-3.05 3.3-4.55 6.4-4.55s5.25 1.5 6.4 4.55"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ShipmentsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 8.2 12 4.2l7.5 4v9.6L12 21.8 4.5 17.8V8.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 12.1v9.4M4.7 8.3 12 12.1l7.3-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function ReportIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.2 4.4h6.4L18.8 9.6v9a1.2 1.2 0 0 1-1.2 1.2H7.2A1.2 1.2 0 0 1 6 18.6V5.6a1.2 1.2 0 0 1 1.2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13.4 4.6v5.2h5.2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13.2h6M9 16.2h3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.6 8.4h2.1l1.2-2.1h8.2l1.2 2.1h2.1A1.6 1.6 0 0 1 21 10v7.2A1.6 1.6 0 0 1 19.4 19H4.6A1.6 1.6 0 0 1 3 17.2V10a1.6 1.6 0 0 1 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.4" r="3.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function BarcodeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3.7"
        y="6.1"
        width="16.6"
        height="11.8"
        rx="3.3"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M7.1 10.15h9.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M7.1 13.85h7.1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M14.2 12.15v3.4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M7 22V10h7.2L25 22H7Z" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M11 17.4h6.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
