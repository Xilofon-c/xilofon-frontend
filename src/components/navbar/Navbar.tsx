import { useCallback, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BolScanner } from './BolScanner'
import { DesktopNavbar } from './DesktopNavbar'
import { MobileNavbar } from './MobileNavbar'
import { DESKTOP_NAV_QUERY } from './navConfig'

export function Navbar() {
  const isDesktop = useMediaQuery(DESKTOP_NAV_QUERY)
  const [scannerOpen, setScannerOpen] = useState(false)
  const openScanner = useCallback(() => setScannerOpen(true), [])
  const closeScanner = useCallback(() => setScannerOpen(false), [])

  return (
    <>
      {isDesktop ? (
        <DesktopNavbar onOpenScanner={openScanner} />
      ) : (
        <MobileNavbar onOpenScanner={openScanner} />
      )}
      <BolScanner open={scannerOpen} onClose={closeScanner} />
    </>
  )
}
