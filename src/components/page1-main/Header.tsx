import { motion } from 'framer-motion';
import './Header.css';
import { useNavigate } from 'react-router-dom';
export function Header() {
  const navigate = useNavigate();
  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wrap">
        <a className="brand" href="#hero" aria-label="Xilofon home">
            <img  src="./logo.png"></img>
          
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#dimensions">Get started</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <button type="button"  className='login-button'
        onClick={()=>navigate('/login')}
        aria-label="Open login page">
          <img src="./login.png" alt="login icon" className='login-icon'></img>
        </button>
      </div>
    </motion.header>
  )
}
