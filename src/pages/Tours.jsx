import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useSettings } from '../context/SettingsContext'
import { db } from '../firebase/config'
import styles from './Tours.module.css'

const DESTINATIONS = [
  { id: 'danautoba',    name: 'Danau Toba' },
  { id: 'sabang',      name: 'Sabang - Banda Aceh' },
  { id: 'sibolga',     name: 'Sibolga & Mursala' },
  { id: 'rafting',     name: 'Rafting Bah Bolon' },
  { id: 'tangkahan',   name: 'Tangkahan' },
  { id: 'combo',       name: 'Combo Sumatera Utara' },
  { id: 'sumbar',      name: 'Sumatera Barat' },
  { id: 'bukitlawang', name: 'Bukit Lawang' },
  { id: 'medan',       name: 'Medan City Tour' },
]

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const minPrice = (tour) => {
  if (tour.paxPricing?.length)
    return Math.min(...tour.paxPricing.map(p => Number(p.price || p.totalPrice || 0)))
  return Number(tour.price || 0)
}

export default function Tours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('semua')
  const [destFilter, setDestFilter] = useState('semua')
  const [currentSlide, setCurrentSlide] = useState(0)
  const { settings } = useSettings()

  const headerImages = [settings.tourHeader1, settings.tourHeader2, settings.tourHeader3].filter(Boolean)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'tours'), orderBy('createdAt', 'desc')))
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch { setTours([]) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (headerImages.length > 1) {
      const t = setInterval(() => setCurrentSlide(p => (p + 1) % headerImages.length), 5000)
      return () => clearInterval(t)
    }
  }, [headerImages.length])

  const waNumber = settings.whatsapp || '6281234567890'
  const usedDests = DESTINATIONS.filter(d => tours.some(t => t.destination === d.id))

  const filtered = tours.filter(t => {
    const typeOk = typeFilter === 'semua' || t.type === typeFilter
    const destOk = destFilter === 'semua' || t.destination === destFilter
    return typeOk && destOk
  })

  return (
    <>
      <Helmet>
        <title>Paket Tour Medan | Dearma Sewa Mobil + Tour</title>
        <meta name="description" content="Paket open trip & private trip ke Danau Toba, Sabang, Bukit Lawang, dan destinasi Sumatera lainnya." />
      </Helmet>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {headerImages.length > 0 ? (
          <>
            <div className={styles.heroSlider}>
              {headerImages.map((img, i) => (
                <div key={i}
                  className={`${styles.heroSlide} ${i === currentSlide ? styles.heroSlideActive : ''}`}
                  style={{ backgroundImage: `url(${img})` }} />
              ))}
            </div>
            <div className={styles.heroOverlay} />
          </>
        ) : (
          <div className={styles.heroBg} />
        )}
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>
            <span className={styles.heroPillDot} />
            Tour Operator Terpercaya — Medan, Sumatera
          </span>
          <h1 className={styles.heroTitle}>
            Paket <span className={styles.heroTitleGold}>Wisata</span><br />
            Sumatera
          </h1>
          <div className={styles.heroGoldLine} />
          <p className={styles.heroSub}>
            Open Trip, Private Trip &amp; Company Trip — aman, nyaman, berkesan.
          </p>
          <div className={styles.heroActions}>
            <button onClick={() => document.getElementById('tours-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className={styles.heroBtn}>
              🗺 Lihat Paket Wisata
            </button>
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Dearma, saya ingin tanya paket wisata')}`}
              target="_blank" rel="noopener noreferrer" className={styles.heroBtnOutline}>
              💬 Konsultasi Gratis
            </a>
          </div>
          <div className={styles.heroStats}>
            {[['6+','Tahun'],['8+','Destinasi'],['5000+','Wisatawan'],['4.9★','Rating']].map(([n,l]) => (
              <div key={l} className={styles.heroStat}>
                <div className={styles.heroStatNum}>{n}</div>
                <div className={styles.heroStatLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {headerImages.length > 1 && (
          <div className={styles.heroDots}>
            {headerImages.map((_, i) => (
              <div key={i} onClick={() => setCurrentSlide(i)}
                className={`${styles.heroDot} ${i === currentSlide ? styles.heroDotActive : ''}`} />
            ))}
          </div>
        )}
      </section>

      {/* ── FILTER ── */}
      <div className={styles.filterBar}>
        <div className={styles.container}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Tipe:</span>
              {[['semua','Semua'],['open','🔓 Open Trip'],['private','🔒 Private Trip']].map(([v,l]) => (
                <button key={v} onClick={() => setTypeFilter(v)}
                  className={`${styles.filterBtn} ${typeFilter === v ? styles.filterBtnActive : ''}`}>
                  {l}
                </button>
              ))}
            </div>
            {usedDests.length > 0 && (
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Destinasi:</span>
                <button onClick={() => setDestFilter('semua')}
                  className={`${styles.filterBtn} ${destFilter === 'semua' ? styles.filterBtnActive : ''}`}>
                  Semua
                </button>
                {usedDests.map(d => (
                  <button key={d.id} onClick={() => setDestFilter(d.id)}
                    className={`${styles.filterBtn} ${destFilter === d.id ? styles.filterBtnActive : ''}`}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filtered.length > 0 && (
            <p className={styles.filterCount}>{filtered.length} paket ditemukan</p>
          )}
        </div>
      </div>

      {/* ── GRID ── */}
      <section className={styles.toursSection} id="tours-grid">
        <div className={styles.container}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Memuat paket wisata…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyWrap}>
              <div className={styles.emptyIcon}>🗺</div>
              <h3>Tidak ada paket ditemukan</h3>
              <p>Coba ubah filter atau hubungi kami untuk paket custom.</p>
              <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Dearma, saya ingin tanya paket wisata')}`}
                target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
                💬 Tanya via WhatsApp
              </a>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((tour, i) => <TourCard key={tour.id} tour={tour} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Siap Untuk Petualangan?</h2>
            <p>Hubungi kami sekarang dan dapatkan penawaran terbaik!</p>
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Dearma, saya ingin booking paket wisata!')}`}
              target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
              💬 Chat WhatsApp Sekarang
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function TourCard({ tour, index }) {
  const [hov, setHov] = useState(false)
  const mp = minPrice(tour)
  const destName = DESTINATIONS.find(d => d.id === tour.destination)?.name

  return (
    <div
      className={`${styles.card} ${hov ? styles.cardHov : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Image */}
      <div className={styles.cardImgWrap}>
        {(tour.heroImage || tour.imageUrl) ? (
          <img src={tour.heroImage || tour.imageUrl} alt={tour.name}
            className={styles.cardImg} loading="lazy" />
        ) : (
          <div className={styles.cardImgPlaceholder}>
            <span>🗺</span>
          </div>
        )}
        <div className={styles.cardImgOverlay} />

        {/* Type badge */}
        {tour.type ? (
          <span className={`${styles.badge} ${tour.type === 'open' ? styles.badgeOpen : styles.badgePrivate}`}>
            {tour.type === 'open' ? 'Open Trip' : 'Private Trip'}
          </span>
        ) : tour.tag ? (
          <span className={styles.badge}>{tour.tag}</span>
        ) : null}

        {/* Duration badge */}
        {tour.duration && <span className={styles.durationBadge}>⏱ {tour.duration}</span>}
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        {destName && <div className={styles.cardDest}>📍 {destName}</div>}
        <h3 className={styles.cardTitle}>{tour.name}</h3>

        {/* Pax pricing row */}
        {tour.paxPricing?.length > 1 && (
          <div className={styles.paxRow}>
            {tour.paxPricing.slice(0, 3).map((p, i) => (
              <span key={i} className={styles.paxChip}>
                {p.label || `${p.pax} Pax`}: {fmt(p.price || p.totalPrice)}
              </span>
            ))}
            {tour.paxPricing.length > 3 && (
              <span className={styles.paxChipMore}>+{tour.paxPricing.length - 3}</span>
            )}
          </div>
        )}

        <div className={styles.cardBottom}>
          <div>
            <div className={styles.priceLabel}>Mulai dari</div>
            <div className={styles.priceVal}>{fmt(mp)}</div>
          </div>
          <Link to={`/paket-wisata/${tour.id}`} className={styles.detailBtn}>
            Detail →
          </Link>
        </div>
      </div>
    </div>
  )
}
