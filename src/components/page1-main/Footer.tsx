import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './Footer.css'

type FooterProps = {
  /** Adds space for the fixed mobile navigation bar. */
  withNav?: boolean
}

export function Footer({ withNav = false }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <motion.footer
      className={`site-footer${withNav ? ' site-footer--nav' : ''}`}
      id="contact"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <img src="/logo.png" alt="Smart Cargo" className="footer-logo" width={118} height={40} />
            <p className="footer-tagline">
              Cargo arrangement for transport companies — vehicle size, bill of
              lading, and a clear load plan.
            </p>
          </div>
          <div>
            <p className="footer-heading">Platform</p>
            <nav className="footer-links" aria-label="Footer">
              <Link to="/">Home</Link>
              <Link to="/shipments/new">New shipment</Link>
              <Link to="/shipments">Shipments</Link>
              <Link to="/report">Report a problem</Link>
            </nav>
          </div>
          <div>
            <p className="footer-heading">Contact</p>
            <nav className="footer-links" aria-label="Contact">
              <a href="mailto:ops@smartcargo.io">ops@smartcargo.io</a>
              <a href="mailto:support@smartcargo.io">support@smartcargo.io</a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} Smart Cargo. All rights reserved.</span>
          <span>Made for load planners and dispatch teams.</span>
        </div>
      </div>
    </motion.footer>
  )
}
