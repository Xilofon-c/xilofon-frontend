import { motion } from 'framer-motion'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <motion.footer
      className="site-footer"
      id="contact"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">Xilofon</p>
            <p className="footer-tagline">
              Cargo arrangement for transport companies — trailer size, bill of
              lading, and a clear load plan.
            </p>
          </div>
          <div>
            <p className="footer-heading">Platform</p>
            <nav className="footer-links" aria-label="Footer">
              <a href="#hero">Home</a>
              <a href="#dimensions">Trailer specs</a>
              <a href="#bol">Bill of lading</a>
            </nav>
          </div>
          <div>
            <p className="footer-heading">Contact</p>
            <nav className="footer-links" aria-label="Contact">
              <a href="mailto:ops@xilofon.io">ops@xilofon.io</a>
              <a href="mailto:support@xilofon.io">support@xilofon.io</a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} Xilofon. All rights reserved.</span>
          <span>Made for load planners and dispatch teams.</span>
        </div>
      </div>
    </motion.footer>
  )
}
