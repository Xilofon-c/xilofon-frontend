import { NavLink } from 'react-router-dom'
import {
  AccountIcon,
  BarcodeIcon,
  HomeIcon,
  ReportIcon,
  ShipmentsIcon,
} from './NavIcons'
import { NAV_LINKS } from './navConfig'

type MobileNavbarProps = {
  onOpenScanner: () => void
}

const MOBILE_ICONS = [HomeIcon, ShipmentsIcon, ReportIcon, AccountIcon] as const

const PILL_MASK = {
  WebkitMaskImage: 'radial-gradient(circle at 50% 0, transparent 38px, #000 39px)',
  maskImage: 'radial-gradient(circle at 50% 0, transparent 38px, #000 39px)',
}

export function MobileNavbar({ onOpenScanner }: MobileNavbarProps) {
  const left = NAV_LINKS.slice(0, 2)
  const right = NAV_LINKS.slice(2)

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <div className="relative mx-auto max-w-lg">
        <div className="relative z-0 [filter:drop-shadow(0_12px_24px_rgba(24,24,27,0.16))]">
          <div className="rounded-[2rem] bg-canvas" style={PILL_MASK}>
            <div className="grid h-[4.4rem] grid-cols-5 items-center px-1.5">
              {left.map((item, index) => (
                <MobileNavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={MOBILE_ICONS[index]}
                />
              ))}

              <div aria-hidden="true" />

              {right.map((item, index) => (
                <MobileNavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={MOBILE_ICONS[index + 2]}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenScanner}
          className="pointer-events-auto absolute top-0 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-[0_8px_20px_rgba(73,10,103,0.35)] transition duration-200 [-webkit-tap-highlight-color:transparent] hover:bg-accent-hover active:scale-95"
          aria-label="Open BOL barcode scanner"
        >
          <BarcodeIcon className="h-[1.35rem] w-[1.35rem]" />
        </button>
      </div>
    </nav>
  )
}

function MobileNavLink({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof HomeIcon
}) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/shipments'}
      className={({ isActive }) =>
        `pointer-events-auto flex min-h-11 flex-col items-center justify-center gap-1 transition ${
          isActive ? 'text-ink' : 'text-[#9a9aa3] hover:text-ink-muted'
        }`
      }
    >
      <Icon className="h-[1.35rem] w-[1.35rem]" />
      <span className="text-[11px] leading-none font-medium">{label}</span>
    </NavLink>
  )
}
