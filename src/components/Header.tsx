import { motion } from 'framer-motion';
import './Header.css';

export function Header() {
  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wrap">
        <a className="brand" href="#hero" aria-label="Xilofon home">
            <img src="./logo.png"></img>
          
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#dimensions">Vehicle specs</a>
          <a href="#bol">Bill of lading</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="btn btn-primary header-cta" href="#dimensions">
          Get started
        </a>
      </div>
    </motion.header>
  )
}
