import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Barcode, Boxes, Route } from 'lucide-react'

const FEATURES = [
  { icon: Boxes, title: 'Automatic load optimisation', copy: 'Every box gets a position that uses the trailer space well.' },
  { icon: Barcode, title: 'Barcoded BOL and boxes', copy: 'Scan a barcode to open the load plan or find a box position.' },
  { icon: Route, title: 'Multi-stop sequencing', copy: 'Cargo for the first stop goes in last. No reloading at stops.' },
]

export function AuthLayout({
  title,
  description,
  children,
  footer,
  showFeatures = true,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Shows the product panel at the right on large screens. */
  showFeatures?: boolean
}) {
  return (
    <div className={`grid min-h-dvh bg-canvas${showFeatures ? ' lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}`}>
      <main id="main" className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="self-start" aria-label="SmartCargo dashboard">
          <img alt="SmartCargo" src="/logo.png" width={118} height={40} className="block h-10 w-auto" />
        </Link>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-copy mb-6">{description}</p> : <div className="mb-6" />}
          {children}
          {footer ? <div className="mt-6 text-center text-[14px] text-ink-muted">{footer}</div> : null}
        </div>

        <p className="text-[12px] text-ink-faint">© {new Date().getFullYear()} SmartCargo</p>
      </main>

      {showFeatures ? (
        <aside className="relative hidden overflow-hidden bg-accent text-white lg:flex lg:flex-col lg:justify-center lg:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-md">
            <p className="text-[12px] font-semibold tracking-[0.08em] text-white/60 uppercase">Cargo arrangement</p>
            <p className="mt-3 text-[28px] leading-tight font-semibold tracking-tight">
              A clear load plan for every trailer.
            </p>
            <p className="mt-3 text-white/70">
              The office creates the bill of lading. The loading bay follows the 3D plan.
            </p>
            <ul className="mt-10 grid gap-6">
              {FEATURES.map(({ icon: Icon, title, copy }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 bg-white/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-[13px] text-white/65">{copy}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
