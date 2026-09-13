import { Link, NavLink } from 'react-router-dom'
import { BarcodeIcon, BrandMark } from './NavIcons'
import { NAV_LINKS } from './navConfig'

type DesktopNavbarProps = {
  onOpenScanner: () => void
}

export function DesktopNavbar({ onOpenScanner }: DesktopNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/92 backdrop-blur-xl">
      <div className="h-[3px] bg-[linear-gradient(90deg,#490a67_0%,#81468d_52%,#490a67_100%)]" />

      <div className="flex h-16 items-center gap-6 px-5 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Xilofon home">
          <BrandMark className="h-8 w-8 shrink-0 text-accent" />
          <span className="min-w-0">
            <span className="block text-[15px] leading-none font-semibold tracking-tight text-ink">
              Xilofon
            </span>
            <span className="mt-1 block text-[11px] leading-none font-medium tracking-[0.04em] text-ink-faint uppercase">
              Load operations
            </span>
          </span>
        </Link>

        <div className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/shipments'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-[13px] font-medium tracking-tight transition ${
                  isActive
                    ? 'bg-canvas-muted text-accent'
                    : 'text-ink-muted hover:bg-canvas-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/shipments/new"
            className={({ isActive }) =>
              `inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-semibold text-white transition ${
                isActive ? 'bg-accent-hover' : 'bg-accent hover:bg-accent-hover'
              }`
            }
          >
            Create
          </NavLink>
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong bg-canvas px-3 text-[13px] font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            <BarcodeIcon className="h-4 w-4" />
            Scan BOL
          </button>

          <Link
            to="/account"
            className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1"
            aria-label="Account profile"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
              OP
            </span>
            <span className="hidden text-[12px] font-semibold text-ink lg:inline">Office</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
