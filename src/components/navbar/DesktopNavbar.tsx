import { Link, NavLink } from 'react-router-dom'
import { LogOut, Plus, ScanBarcode } from 'lucide-react'
import { initialsOf, readSession, ROLE_LABEL } from '../../lib/session'
import { isExactRoute, NAV_LINKS } from './navConfig'

type DesktopNavbarProps = {
  onOpenScanner: () => void
}

export function DesktopNavbar({ onOpenScanner }: DesktopNavbarProps) {
  const session = readSession()

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line bg-canvas">
      <div className="flex h-full items-center gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="SmartCargo home">
          <img alt="SmartCargo" src="/logo.png" width={118} height={40} className="block h-10 w-auto" />
        </Link>

        <nav className="flex h-full min-w-0 flex-1 items-stretch gap-1 overflow-x-auto" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={isExactRoute(item.to)}
              className={({ isActive }) =>
                `relative flex items-center px-3 text-[14px] font-medium whitespace-nowrap transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full ${
                  isActive
                    ? 'text-accent after:bg-accent'
                    : 'text-ink-muted after:bg-transparent hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenScanner} className="btn btn-ghost btn-sm">
            <ScanBarcode className="h-4 w-4" aria-hidden="true" />
            Scan BOL
          </button>
          <Link to="/shipments/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New shipment
          </Link>

          <div className="mx-2 h-6 w-px bg-line" aria-hidden="true" />

          <Link
            to="/account"
            className="flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors hover:bg-canvas-muted"
            aria-label={`Account: ${session.name}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white">
              {initialsOf(session.name)}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-[13px] leading-4 font-semibold text-ink">{session.name}</span>
              <span className="block text-[12px] leading-4 text-ink-faint">{ROLE_LABEL[session.role]}</span>
            </span>
          </Link>
          <Link
            to="/logout"
            className="btn btn-quiet btn-sm px-2"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
