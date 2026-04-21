import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import logo from '../assets/logo.svg'
import styles from './Navbar.module.css'

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/armada', label: 'Armada' },
  { to: '/paket-wisata', label: 'Paket Tour' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/kontak', label: 'Kontak' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { settings } = useSettings()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <img src={settings.logoUrl || logo} alt="Dearma Sewa Mobil" className={styles.logo} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>DEARMA</span>
            <span className={styles.brandSub}>Sewa Mobil Medan</span>
          </div>
        </Link>

        <div className={`${styles.links} ${open ? styles.open : ''}`}>
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://wa.me/6281234567890?text=Halo+Dearma%2C+saya+ingin+tanya+tentang+rental+mobil"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Pesan Sekarang
          </a>
        </div>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
