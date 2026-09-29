import { Link, NavLink } from 'react-router-dom'
import { Plus, ScanBarcode, type LucideIcon } from 'lucide-react'
import { isExactRoute, NAV_LINKS } from './navConfig'

type MobileNavbarProps = {
  onOpenScanner: () => void
}

const PILL_MASK = {
  WebkitMaskImage: 'radial-gradient(circle at 50% 0, transparent 36px, #000 37px)',
  maskImage: 'radial-gradient(circle at 50% 0, transparent 36px, #000 37px)',
}

export function MobileNavbar({ onOpenScanner }: MobileNavbarProps) {
  const left = NAV_LINKS.slice(0, 2)
  const right = NAV_LINKS.slice(2)

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[var(--header-h)] items-center justify-between border-b border-line bg-canvas px-4">
        <Link to="/" aria-label="SmartCargo dashboard">
          <img alt="SmartCargo" src="/logo.png" width={100} height={34} className="block h-8 w-auto" />
        </Link>
        <Link to="/shipments/new" className="btn btn-primary btn-sm" aria-label="New shipment">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New
        </Link>
      </header>

      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
        aria-label="Primary"
      >
        <div className="relative mx-auto max-w-lg">
          <div className="relative z-0 [filter:drop-shadow(0_6px_16px_rgba(24,24,27,0.14))]">
            <div className="rounded-2xl border border-line bg-canvas" style={PILL_MASK}>
              <div className="grid h-16 grid-cols-5 items-center px-1">
                {left.map((item) => (
                  <MobileNavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
                ))}
                <span className="pt-7 text-center text-[11px] font-medium text-ink-muted" aria-hidden="true">
                  Scan
                </span>
                {right.map((item) => (
                  <MobileNavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="pointer-events-auto absolute top-0 left-1/2 z-10 flex h-13 w-13 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_16px_rgba(73,10,103,0.3)] transition [-webkit-tap-highlight-color:transparent] hover:bg-accent-hover active:scale-95"
            aria-label="Scan BOL barcode"
          >
            <ScanBarcode className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </>
  )
}

function MobileNavLink({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      end={isExactRoute(to)}
      className={({ isActive }) =>
        `pointer-events-auto flex min-h-11 flex-col items-center justify-center gap-1 transition-colors ${
          isActive ? 'text-accent' : 'text-ink-faint hover:text-ink'
        }`
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
      <span className="text-[11px] leading-none font-medium">{label}</span>
    </NavLink>
  )
}
