import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
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
  const [otherTours, setOtherTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('informasi')
  const [selectedPax, setSelectedPax] = useState(null)
  const [selectedCar, setSelectedCar] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'tours', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const tourData = { id: docSnap.id, ...docSnap.data() }
          setTour(tourData)
          // Set initial pax dan car
          if (tourData.paxPricing && tourData.paxPricing.length > 0) {
            const uniquePax = [...new Set(tourData.paxPricing.map(p => p.pax))].sort((a,b) => a-b)
            if (uniquePax.length > 0) {
              setSelectedPax(uniquePax[0])
              const carsForFirstPax = tourData.paxPricing.filter(p => p.pax === uniquePax[0]).map(p => p.carType)
              setSelectedCar(carsForFirstPax[0] || '')
            }
          }
        } else {
          navigate('/paket-wisata')
          return
        }

        const toursSnap = await getDocs(collection(db, 'tours'))
        const allTours = toursSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.id !== id)
        setOtherTours(allTours.slice(0, 3))
      } catch (e) {
        navigate('/paket-wisata')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const waBase = 'https://wa.me/6281234567890?text='

  // Get unique pax options from paxPricing
  const getPaxOptions = () => {
    if (!tour?.paxPricing) return []
    return [...new Set(tour.paxPricing.map(p => p.pax))].sort((a,b) => a-b)
  }

  // Get car types for selected pax
  const getCarOptionsForPax = (pax) => {
    if (!tour?.paxPricing) return []
    return [...new Set(tour.paxPricing.filter(p => p.pax === pax).map(p => p.carType))]
  }

  // Get total price for selected pax & car
  const getTotalPrice = (pax, carType) => {
    if (!tour?.paxPricing) return null
    const match = tour.paxPricing.find(p => p.pax === pax && p.carType === carType)
    return match ? (match.totalPrice || match.price) : null
  }

  const paxOptions = getPaxOptions()
  const carOptions = selectedPax ? getCarOptionsForPax(selectedPax) : []
  const currentPrice = selectedPax && selectedCar ? getTotalPrice(selectedPax, selectedCar) : null

  // Update car when pax changes
  useEffect(() => {
    if (selectedPax && carOptions.length > 0 && !carOptions.includes(selectedCar)) {
      setSelectedCar(carOptions[0])
    } else if (!selectedPax) {
      setSelectedCar('')
    }
  }, [selectedPax, carOptions])

  const waMessage = selectedPax && selectedCar && currentPrice
    ? `Halo Dearma, saya tertarik dengan paket tour *${tour?.name || ''}*.\n\nDurasi: ${tour?.duration || '-'}\nJumlah Orang: ${selectedPax}\nJenis Mobil: ${selectedCar}\nHarga total: ${formatPrice(currentPrice)}\n\nMohon info ketersediaan dan jadwal terdekat.`
    : `Halo Dearma, saya tertarik dengan paket tour *${tour?.name || ''}*.\n\nMohon info detail harga dan ketersediaan.`

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

  const tabs = [
    { id: 'informasi', label: 'Informasi' },
    { id: 'itinerary', label: 'Itinerary', show: tour.itinerary },
    { id: 'catatan', label: 'Catatan', show: tour.notes },
    { id: 'lokasi', label: 'Lokasi', show: tour.location },
    { id: 'faq', label: 'FAQ', show: tour.faq },
  ].filter(t => t.show !== false)

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

      {/* Sticky Tabs */}
      <div className={styles.stickyTabs}>
        <div className="container">
          <div className={styles.tabsList}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column */}
      <section className={styles.content}>
        <div className="container">
          <div className={styles.tourGrid}>
            {/* Left Column - Dynamic Content */}
            <div className={styles.tourMain}>
              {tab === 'informasi' && (
                <div className={styles.section}>
                  <h2>Informasi Paket</h2>
                  <p className={styles.description}>{tour.description}</p>

                  {tour.included && (
                    <div className={styles.inclusion}>
                      <h3>Termasuk</h3>
                      <ul>{tour.included.split('\n').filter(Boolean).map((item, idx) => (
                        <li key={idx}><span className={styles.checkIcon}>✓</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}

                  {tour.excluded && (
                    <div className={styles.inclusion}>
                      <h3>Tidak Termasuk</h3>
                      <ul>{tour.excluded.split('\n').filter(Boolean).map((item, idx) => (
                        <li key={idx}><span className={styles.crossIcon}>✗</span>{item}</li>
                      ))}</ul>
                    </div>
                  )}
                </div>
              )}

              {tab === 'itinerary' && tour.itinerary && (
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

              {tab === 'catatan' && tour.notes && (
                <div className={styles.section}>
                  <h2>Catatan Penting</h2>
                  <p className={styles.notes}>{tour.notes}</p>
                </div>
              )}

              {tab === 'lokasi' && tour.location && (
                <div className={styles.section}>
                  <h2>Lokasi</h2>
                  <p className={styles.locationText}>{tour.location}</p>
                </div>
              )}

              {tab === 'faq' && tour.faq && (
                <div className={styles.section}>
                  <h2>FAQ</h2>
                  <div className={styles.faqList}>
                    {tour.faq.split('\n').filter(Boolean).map((q, idx) => (
                      <div key={idx} className={styles.faqItem}>
                        <strong>Q: {q}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Tours */}
              {otherTours.length > 0 && (
                <div className={styles.section}>
                  <h2>Paket Tour Lainnya</h2>
                  <div className={styles.otherToursGrid}>
                    {otherTours.map((t, idx) => (
                      <Link key={t.id} to={`/paket-wisata/${t.id}`} className={styles.otherTourCard} style={{ animationDelay: `${idx * 0.1}s` }}>
                        {t.imageUrl && (
                          <div className={styles.otherTourImage}>
                            <img src={t.imageUrl} alt={t.name} loading="lazy" />
                          </div>
                        )}
                        <div className={styles.otherTourInfo}>
                          <h3>{t.name}</h3>
                          {t.duration && <span className={styles.otherTourDuration}>{t.duration}</span>}
                          <span className={styles.otherTourPrice}>{formatPrice(t.price)}/pax</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className={styles.tourSidebar}>
              <div className={styles.bookingCard}>
                <h3>Harga Paket</h3>
                <div className={styles.priceDisplay}>
                  <span className={styles.priceLabel}>Per orang</span>
                  <span className={styles.priceValue}>{formatPrice(tour.price)}</span>
                </div>

                {/* Pax Selection - Buttons */}
                {paxOptions.length > 0 && (
                  <div className={styles.paxSelector}>
                    <label>Pilih Jumlah Orang</label>
                    <div className={styles.paxButtons}>
                      {paxOptions.map(pax => (
                        <button
                          key={pax}
                          className={`${styles.paxBtn} ${selectedPax === pax ? styles.paxBtnActive : ''}`}
                          onClick={() => setSelectedPax(pax)}
                        >
                          {pax} orang
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Car Type Selection */}
                {carOptions.length > 0 && (
                  <div className={styles.paxSelector}>
                    <label htmlFor="carType">Jenis Mobil</label>
                    <select
                      id="carType"
                      value={selectedCar}
                      onChange={e => setSelectedCar(e.target.value)}
                      className={styles.paxSelect}
                    >
                      {carOptions.map(car => (
                        <option key={car} value={car}>{car}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Total Price */}
                {currentPrice && (
                  <div className={styles.totalPrice}>
                    <span>Total ({selectedPax} orang):</span>
                    <strong>{formatPrice(currentPrice)}</strong>
                  </div>
                )}

                <a
                  href={`${waBase}${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bookBtn}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  Booking via WhatsApp
                </a>

                <div className={styles.shareSection}>
                  <h4>Bagikan Paket</h4>
                  <div className={styles.shareButtons}>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} title="Bagikan di Facebook">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href={`mailto:?subject=${encodeURIComponent(`Paket Tour ${tour.name}`)}&body=${encodeURIComponent(`Halo, saya ingin berbagi info tentang paket tour ${tour.name}.\n\nDetail: ${window.location.href}`)}`} className={styles.shareBtn} title="Bagikan via Email">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </a>
                    <a href={`${waBase}${encodeURIComponent(`Halo, saya ingin berbagi info paket tour *${tour.name}*. Cek detail di: ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} title="Bagikan via WhatsApp">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    </a>
                    <button className={styles.shareBtn} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link disalin!') }} title="Salin Link">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar */}
      {selectedPax && selectedCar && currentPrice && (
        <div className={styles.mobileBottomBar}>
          <div className={styles.mobilePriceInfo}>
            <span>Total ({selectedPax} orang):</span>
            <strong>{formatPrice(currentPrice)}</strong>
          </div>
          <a href={`${waBase}${encodeURIComponent(waMessage)}`} className={styles.mobileBookBtn}>
            Booking
          </a>
        </div>
      )}

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
