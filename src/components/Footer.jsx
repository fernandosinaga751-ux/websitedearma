import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import logo from '../assets/logo.svg'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings } = useSettings()
  const waNumber = settings.whatsapp || '6281234567890'

  return (
    <footer className={styles.footer}>
      {/* Gold line top */}
      <div className={styles.topLine} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img src={settings.logoUrl || logo} alt="Dearma" />
              <div>
                <span className={styles.name}>DEARMA</span>
                <span className={styles.sub}>Sewa Mobil Medan</span>
              </div>
            </Link>
            <p className={styles.desc}>
              {settings.address || 'Layanan rental mobil premium di Medan. Armada lengkap, sopir profesional, dan harga terjangkau.'}
            </p>
            <div className={styles.socials}>
              <a
                href={settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : "https://www.instagram.com/dearmasewamobil"}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeLinecap="round" strokeWidth="3"/>
                </svg>
              </a>
              <a
                href={settings.facebook ? `https://facebook.com/${settings.facebook}` : "https://www.facebook.com/dearmasewamobil"}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Navigasi</h4>
            <ul className={styles.list}>
              <li><Link to="/">Beranda</Link></li>
              <li><Link to="/armada">Armada Mobil</Link></li>
              <li><Link to="/artikel">Artikel</Link></li>
              <li><Link to="/kontak">Kontak Kami</Link></li>
            </ul>
          </div>

          {/* Cars */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Armada Kami</h4>
            <ul className={styles.list}>
              <li><Link to="/armada">Toyota Alphard</Link></li>
              <li><Link to="/armada">Toyota Fortuner</Link></li>
              <li><Link to="/armada">Toyota Innova Zenix</Link></li>
              <li><Link to="/armada">Toyota Hiace Premio</Link></li>
              <li><Link to="/armada">Mitsubishi Pajero Sport</Link></li>
              <li><Link to="/armada">Toyota Avanza</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Hubungi Kami</h4>
            <ul className={styles.contact}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.96-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+6281234567890">0812-3456-7890</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Medan, Sumatera Utara</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Tersedia 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {year} Dearma Sewa Mobil Medan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
