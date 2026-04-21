import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import styles from './TourDetail.module.css'

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const docRef = doc(db, 'tours', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setTour({ id: docSnap.id, ...docSnap.data() })
        } else {
          navigate('/paket-wisata')
        }
      } catch (e) {
        navigate('/paket-wisata')
      } finally {
        setLoading(false)
      }
    }
    fetchTour()
  }, [id, navigate])

  const waBase = 'https://wa.me/6281234567890?text='

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Memuat detail tour...</p>
        </div>
        <Footer />
        <WhatsAppButton />
      </>
    )
  }

  if (!tour) return null

  return (
    <>
      <Helmet>
        <title>{tour.name} | Dearma Tour</title>
        <meta name="description" content={tour.description?.slice(0, 160) || `Paket tour ${tour.name} - ${tour.duration}`} />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        {tour.imageUrl ? (
          <img src={tour.imageUrl} alt={tour.name} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </div>
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className="container">
            <Link to="/paket-wisata" className={styles.backLink}>
              ← Kembali ke Paket Tour
            </Link>
            {tour.tag && <span className={styles.tag}>{tour.tag}</span>}
            <h1 className={styles.title}>{tour.name}</h1>
            {tour.duration && <div className={styles.duration}>{tour.duration}</div>}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.main}>
              <div className={styles.section}>
                <h2>Tentang Tour</h2>
                <p className={styles.description}>{tour.description}</p>
              </div>

              {tour.itinerary && (
                <div className={styles.section}>
                  <h2>Itinerary</h2>
                  <div className={styles.itinerary}>
                    {tour.itinerary.split('\n').filter(Boolean).map((day, idx) => (
                      <div key={idx} className={styles.itineraryItem}>
                        <div className={styles.dayNumber}>Hari {idx + 1}</div>
                        <p>{day}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h2>Detail Harga</h2>
                <div className={styles.priceBox}>
                  <div className={styles.priceMain}>
                    <span className={styles.priceLabel}>Harga Paket</span>
                    <span className={styles.priceValue}>{formatPrice(tour.price)}<small>/pax</small></span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h2>Termasuk</h2>
                <ul className={styles.includesList}>
                  {tour.included?.split('\n').filter(Boolean).map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {tour.excluded && (
                <div className={styles.section}>
                  <h2>Tidak Termasuk</h2>
                  <ul className={styles.excludesList}>
                    {tour.excluded.split('\n').filter(Boolean).map((item, idx) => (
                      <li key={idx}>
                        <span className={styles.crossIcon}>✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.sidebar}>
              <div className={styles.bookingCard}>
                <h3>Booking Tour Ini</h3>
                <div className={styles.priceDisplay}>
                  <span className={styles.priceLabel}>Harga per orang</span>
                  <span className={styles.priceValue}>{formatPrice(tour.price)}</span>
                </div>
                <a
                  href={`${waBase}${encodeURIComponent(`Halo Dearma, saya ingin booking paket tour *${tour.name}*.\n\nDurasi: ${tour.duration || '-' }\nHarga: ${formatPrice(tour.price)}/pax\n\nMohon info ketersediaannya.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bookBtn}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  Booking via WhatsApp
                </a>
                <p className={styles.note}>Hubungi kami untuk informasi lengkap dan ketersediaan</p>
              </div>

              <div className={styles.infoCard}>
                <h3>Informasi</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Durasi</span>
                  <span className={styles.infoValue}>{tour.duration || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Min. Peserta</span>
                  <span className={styles.infoValue}>{tour.minParticipants || '1'} orang</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ingin Tour Custom?</h2>
          <p>Bisa buat itinerary sendiri atau modify paket tour ini sesuai keinginan Anda.</p>
          <a href={`${waBase}${encodeURIComponent('Halo Dearma, saya ingin konsultasi tour custom')}`} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            Konsultasi Gratis
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  )
}