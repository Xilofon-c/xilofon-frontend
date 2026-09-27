import { Link, NavLink } from 'react-router-dom'
import { BarcodeIcon, BrandMark } from './NavIcons'
import { NAV_LINKS } from './navConfig'
import {useNavigate} from 'react-router-dom'
type DesktopNavbarProps = {
  onOpenScanner: () => void
}

export function DesktopNavbar({ onOpenScanner }: DesktopNavbarProps) {
  const navigate=useNavigate();
  const isLoggedIn=!!localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/92 backdrop-blur-xl">
      <div className="h-[3px] bg-[linear-gradient(90deg,#490a67_0%,#81468d_52%,#490a67_100%)]" />

      <div className="flex h-16 items-center gap-6 px-5 lg:px-8">
        <Link to="/" className="flex w-[200px] items-center ml-10" >
         <img alt="logo" src="logo.png" className='w-[150px]'></img>
          
        </Link>

        <div className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap " aria-label="Primary">
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
          {userRole==='office' &&(
          <NavLink
            to="/shipments/new"
            className={({ isActive }) =>
              `inline-flex min-h-10 items-center rounded-lg px-3 text-[13px] font-semibold !text-white transition ${
                isActive ? 'bg-accent-hover' : 'bg-accent  hover:bg-accent-hover'
              }`
            }
          >
            Create
          </NavLink> )}
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong bg-canvas px-3 text-[13px] font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            <BarcodeIcon className="h-4 w-4" />
            Scan BOL
          </button>

          {isLoggedIn? (

          <Link
            to="/account"
            className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1"
            aria-label="Account profile"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
              OP
            </span>
            <span className="hidden text-[12px] font-semibold text-ink lg:inline">Office</span>
          </Link>) :(
            <button
                type="button"
                className="border-none bg-[var(--bg)]"
                   onClick={() => navigate('/login')}
              aria-label="Open login page"
  >
    <img
      src="./login.png"
      alt="login icon"
      className="flex h-[35px] w-[35px] cursor-pointer items-center"
        />
         </button>
          )

}
</div>
      </div>
    </header>
  )
}
