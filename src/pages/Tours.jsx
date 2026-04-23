import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useSettings } from '../context/SettingsContext'
import { db } from '../firebase/config'
import styles from './Tours.module.css'

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function Tours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { settings } = useSettings()

  const headerImages = [settings.tourHeader1, settings.tourHeader2, settings.tourHeader3].filter(Boolean)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursSnap = await getDocs(query(collection(db, 'tours'), orderBy('createdAt', 'desc')))
        setTours(toursSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        setTours([])
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

  const waNumber = settings.whatsapp || '6281234567890'
  const waBase = `https://wa.me/${waNumber}?text=`

  return (
    <>
      <Helmet>
        <title>Paket Tour Medan | Dearma Sewa Mobil + Tour</title>
        <meta name="description" content="Paket tour Medan dan Sumatera Utara bersama Dearma. Lake Toba, Brastagi, Bukit Lawang, dan destinasi lainnya. Incluye mobil dan sopir profesional." />
      </Helmet>

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
            <p className={styles.tag}>Jelajahi Sumatera</p>
            <h1 className={styles.title}>PAKET<br />TOUR</h1>
            <div className="gold-line" />
            <p className={styles.subtitle}>
              Nikmati perjalanan tak terlupakan dengan paket tour lengkap Incluye mobil premium dan sopir berpengalaman
            </p>
          </div>
        </div>
      </section>

      <section className={styles.toursSection}>
        <div className="container">
          {loading ? (
            <div className={styles.loading}>Memuat paket tour...</div>
          ) : tours.length === 0 ? (
            <div className={styles.empty}>
              <h3>Belum Ada Paket Tour</h3>
              <p>Paket tour akan segera tersedia. Hubungi kami untuk informasi tour customize!</p>
              <a href={`${waBase}${encodeURIComponent('Halo Dearma, saya ingin bertanya tentang paket tour')}`} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
                Hubungi via WhatsApp
              </a>
            </div>
          ) : (
            <div className={styles.grid}>
              {tours.map((tour, i) => (
                <div key={tour.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
                  {tour.tag && <div className={styles.tag2}>{tour.tag}</div>}
                  
                  <div className={styles.imageWrap}>
                    <Link to={`/paket-wisata/${tour.id}`}>
                      {tour.imageUrl ? (
                        <img src={tour.imageUrl} alt={tour.name} className={styles.image} loading="lazy" />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                          </svg>
                        </div>
                      )}
                      <div className={styles.imageOverlay}>
                        <span>Lihat Detail</span>
                      </div>
                    </Link>
                  </div>

                  <div className={styles.cardBody}>
                    <h2 className={styles.tourName}>{tour.name}</h2>
                    {tour.duration && <div className={styles.duration}>{tour.duration}</div>}
                    <p className={styles.desc}>{tour.description}</p>

                    <div className={styles.includes}>
                      <h4>Termasuk:</h4>
                      <ul>{tour.included?.split('\n').filter(Boolean).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}</ul>
                    </div>

                    <div className={styles.pricing}>
                      <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>Harga Paket</span>
                        <span className={styles.price}>{formatPrice(tour.price)}<small>/pax</small></span>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <a
                        href={`${waBase}${encodeURIComponent(`Halo Dearma, saya tertarik dengan paket tour *${tour.name}${tour.duration ? ` (${tour.duration})` : ''}*.\nHarga: ${formatPrice(tour.price)}/pax\n\nMohon info ketersediaannya.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.bookBtn}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                        Booking Sekarang
                      </a>
                      <button onClick={() => setSelected(tour)} className={styles.detailBtn}>
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ingin Tour Custom?</h2>
            <p>Butuh pakettour kustom sesuai kebutuhan? Kami siap membantu rencana perjalanan Anda.</p>
            <a href={`${waBase}${encodeURIComponent('Halo Dearma, saya ingin konsultasi tour custom')}`} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
              Konsultasi Gratis
            </a>
          </div>
        </div>
      </section>

      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelected(null)}>×</button>
            <div className={styles.modalImg}>
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.name} />
              ) : (
                <div className={styles.imagePlaceholder} style={{ height: '100%' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.modalBody}>
              <div className={styles.category}>{selected.tag}</div>
              <h2 className={styles.tourName} style={{ fontSize: '1.6rem' }}>{selected.name}</h2>
              {selected.duration && <div className={styles.duration}>{selected.duration}</div>}
              <p style={{ color: '#8892a4', margin: '12px 0 20px', lineHeight: 1.7 }}>{selected.description}</p>
              
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#c9a227', marginBottom: 8 }}>Termasuk:</h4>
                <ul style={{ color: '#6b7280' }}>
                  {selected.included?.split('\n').filter(Boolean).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              
              {selected.excluded && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#ef4444', marginBottom: 8 }}>Tidak Termasuk:</h4>
                  <ul style={{ color: '#6b7280' }}>
                    {selected.excluded.split('\n').filter(Boolean).map((item, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>✗ {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.pricing} style={{ marginBottom: 24 }}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Harga Paket</span>
                  <span className={styles.price}>{formatPrice(selected.price)}<small>/pax</small></span>
                </div>
              </div>
              <a
                href={`${waBase}${encodeURIComponent(`Halo Dearma, saya ingin booking paket tour *${selected.name}*`)}`}
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