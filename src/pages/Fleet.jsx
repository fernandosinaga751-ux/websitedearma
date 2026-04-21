import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useSettings } from '../context/SettingsContext'
import { db } from '../firebase/config'
import { formatPrice } from '../data/cars'
import { cars as staticCars } from '../data/cars'
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

  const carList = dbCars.length > 0 ? dbCars : staticCars
  const filtered = filter === 'Semua' ? carList : carList.filter(c => c.category === filter)
  const waBase = 'https://wa.me/6281234567890?text='
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
                  <img src={car.imageUrl || car.image || '/placeholder-car.jpg'} alt={car.name} className={styles.image} loading="lazy" />
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
                    <a
                      href={`${waBase}${encodeURIComponent(`Halo Dearma, saya ingin booking *${car.name}*.\nHarga: ${formatPrice(car.pricePerDay)}/hari\n\nMohon info ketersediaannya. Terima kasih.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.bookBtn}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                      Booking Sekarang
                    </a>
                    <button onClick={() => setSelected(car)} className={styles.detailBtn}>
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <a
                href={`${waBase}${encodeURIComponent(`Halo Dearma, saya ingin booking *${selected.name}*. Mohon info ketersediaannya.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.bookBtn}
                style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
              >
                Booking via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
