import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useSettings } from '../context/SettingsContext'
import { db } from '../firebase/config'
import { formatPrice } from '../data/cars'
import styles from './Fleet.module.css'

const categories = ['Semua', 'MPV', 'MPV Premium', 'SUV', 'Luxury MPV', 'Luxury Hybrid', 'Minibus', 'Luxury Minibus']

export default function Fleet() {
  const [filter, setFilter] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const [dbCars, setDbCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { settings } = useSettings()

  const headerImages = [settings.fleetHeader1, settings.fleetHeader2, settings.fleetHeader3].filter(Boolean)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carsSnap = await getDocs(query(collection(db, 'cars'), orderBy('createdAt', 'desc')))
        if (!carsSnap.empty) {
          setDbCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        }
      } catch (e) {
        // use static data on error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (headerImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(p => (p + 1) % headerImages.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [headerImages.length])

   const carList = dbCars
   const filtered = filter === 'Semua' ? carList : carList.filter(c => c.category === filter)
  const waNumber = settings.whatsapp || '6281234567890'
  const waBase = `https://wa.me/${waNumber}?text=`
  const cars = carList

  return (
    <>
      <Helmet>
        <title>Armada Mobil | Dearma Sewa Mobil Medan</title>
        <meta name="description" content="Lihat lengkap armada rental mobil Dearma Sewa Mobil Medan. Toyota Alphard, Fortuner, Innova Zenix, Hiace Premio, Pajero Sport, Avanza. Harga terjangkau dan armada terawat." />
      </Helmet>

      {/* Page Header with Slider */}
      <section className={styles.header}>
        {headerImages.length > 0 ? (
          <>
            <div className={styles.headerSlider}>
              {headerImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.slide} ${idx === currentSlide ? styles.slideActive : ''}`}
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
            </div>
            <div className={styles.headerOverlay} />
          </>
        ) : (
          <div className={styles.headerBg} />
        )}
        <div className="container">
          <div className={styles.headerContent}>
            <p className={styles.tag}>Pilihan Lengkap</p>
            <h1 className={styles.title}>ARMADA<br />KAMI</h1>
            <div className="gold-line" />
            <p className={styles.subtitle}>
              {cars.length} unit tersedia · Dari MPV keluarga hingga luxury van eksklusif
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className={styles.carsSection}>
        <div className="container">
          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map((car, i) => (
                <div
                  key={car.id}
                  className={styles.card}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {car.tag && <div className={styles.tag2}>{car.tag}</div>}

                  <div
                    className={styles.imageWrap}
                    onClick={() => setSelected(car)}
                  >
                    {car.imageUrl ? (
                      <img src={car.imageUrl} alt={car.name} className={styles.image} loading="lazy" />
                    ) : (
                      <div className={styles.noImage}>Gambar akan tersedia</div>
                    )}
                    <div className={styles.imageOverlay}>
                      <span>Lihat Detail</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.category}>{car.category}</div>
                    <h2 className={styles.carName}>{car.name}</h2>

                    <div className={styles.specs}>
                      <div className={styles.spec}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {car.seats} Penumpang
                      </div>
                    </div>

                    <div className={styles.features}>
                      {car.features.map(f => (
                        <span key={f} className={styles.feature}>{f}</span>
                      ))}
                    </div>

                    <p className={styles.desc}>{car.description}</p>

                    <div className={styles.pricing}>
                      <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>Tanpa Sopir</span>
                        <span className={styles.price}>{formatPrice(car.pricePerDay)}<small>/hari</small></span>
                      </div>
                      <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>Dengan Sopir</span>
                        <span className={styles.price}>{formatPrice(car.priceWithDriver)}<small>/hari</small></span>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Link
                        to={`/booking?car=${car.id}`}
                        className={styles.bookBtn}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Booking Sekarang
                      </Link>
                      <button onClick={() => setSelected(car)} className={styles.detailBtn}>
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCars}>Belum ada armada yang ditambahkan.</div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelected(null)}>×</button>
            <div className={styles.modalImg}>
              <img src={selected.imageUrl || selected.image || '/placeholder-car.jpg'} alt={selected.name} />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.category}>{selected.category}</div>
              <h2 className={styles.carName} style={{ fontSize: '1.6rem' }}>{selected.name}</h2>
              <p style={{ color: '#8892a4', margin: '12px 0 20px', lineHeight: 1.7 }}>{selected.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {selected.features.map(f => (
                  <span key={f} className={styles.feature} style={{ background: 'rgba(201,162,39,0.1)', borderColor: 'rgba(201,162,39,0.3)', color: '#c9a227' }}>{f}</span>
                ))}
              </div>
              <div className={styles.pricing} style={{ marginBottom: 24 }}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Tanpa Sopir</span>
                  <span className={styles.price}>{formatPrice(selected.pricePerDay)}<small>/hari</small></span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Dengan Sopir</span>
                  <span className={styles.price}>{formatPrice(selected.priceWithDriver)}<small>/hari</small></span>
                </div>
              </div>
              <Link
                to={`/booking?car=${selected.id}`}
                className={styles.bookBtn}
                style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
              >
                Booking Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
