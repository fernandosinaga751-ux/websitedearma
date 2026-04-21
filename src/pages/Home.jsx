import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { useSettings } from '../context/SettingsContext'
import { db } from '../firebase/config'
import { formatPrice, cars as staticCars } from '../data/cars'
import styles from './Home.module.css'
import logo from '../assets/logo.svg'

// === HERO SECTION ===
function Hero() {
  const [loaded, setLoaded] = useState(false)
  const { settings } = useSettings()
  useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])

  const waNumber = settings.whatsapp || '6281234567890'
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Dearma, saya ingin memesan mobil rental')}`

  return (
    <section className={styles.hero}>
      {/* Animated road lines */}
      <div className={styles.road}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.roadLine} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>

      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className={styles.grid} />

      {/* Glow orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={`${styles.heroContent} ${loaded ? styles.loaded : ''}`}>
        <div className={styles.badge}>
          <div className={styles.badgeDot} />
          <span>Tersedia 24/7 — Siap Melayani</span>
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine1}>RENTAL MOBIL</span>
          <span className={styles.titleLine2}>PREMIUM</span>
          <span className={styles.titleLine3}>MEDAN</span>
        </h1>

        <p className={styles.heroDesc}>
          Nikmati perjalanan tak terlupakan bersama armada premium kami.<br />
          Dari city car hingga luxury MPV — semua tersedia untuk Anda.
        </p>

        <div className={styles.heroCta}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Pesan via WhatsApp
          </a>
          <Link to="/armada" className={styles.ctaSecondary}>
            Lihat Armada
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Animated logo/car visual */}
      <div className={`${styles.heroVisual} ${loaded ? styles.visualLoaded : ''}`}>
        <div className={styles.logoGlow}>
          <img src={logo} alt="Dearma" className={styles.heroLogo} />
        </div>
        <div className={styles.orbit}>
          {['Alphard', 'Fortuner', 'Hiace', 'Innova'].map((c, i) => (
            <div
              key={c}
              className={styles.orbitItem}
              style={{ '--i': i, '--total': 4 }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <span>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}

// === FEATURES SECTION ===
function Features() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Armada Terawat',
      desc: 'Setiap unit rutin diperiksa dan dirawat oleh mekanik berpengalaman untuk keamanan perjalanan Anda.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: 'Tersedia 24 Jam',
      desc: 'Layanan kami beroperasi 24 jam sehari, 7 hari seminggu. Kapanpun Anda butuhkan, kami siap.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: 'Sopir Profesional',
      desc: 'Driver kami terlatih, berpengalaman, dan mengenal baik seluruh rute di Medan dan sekitarnya.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: 'Harga Transparan',
      desc: 'Tidak ada biaya tersembunyi. Harga sudah mencakup BBM, sopir, dan asuransi perjalanan.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      title: 'Antar Jemput',
      desc: 'Layanan antar jemput ke bandara, hotel, atau alamat yang Anda tentukan di seluruh Medan.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
      ),
      title: 'Kepuasan Terjamin',
      desc: 'Ribuan pelanggan telah mempercayai kami. Kepuasan Anda adalah prioritas utama kami.'
    }
  ]

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>Keunggulan Kami</p>
          <h2 className="section-title">KENAPA PILIH<br />DEARMA?</h2>
          <div className="gold-line" />
          <p className="section-subtitle">Kami mengutamakan kenyamanan, keamanan, dan kepuasan Anda dalam setiap perjalanan.</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={styles.featureCard}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// === FEATURED CARS ===
function FeaturedCars() {
  const [dbCars, setDbCars] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setDbCars(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }
      } catch (e) {
        // use static data
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [])

  const carList = dbCars.length > 0 ? dbCars : staticCars
  const featured = carList.slice(0, 6)
  const waNumber = settings.whatsapp || '6281234567890'
  const waBase = `https://wa.me/${waNumber}?text=`

  return (
    <section className={styles.featuredCars}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>Pilihan Terpopuler</p>
          <h2 className="section-title">ARMADA<br />UNGGULAN</h2>
          <div className="gold-line" />
          <p className="section-subtitle">Armada terpilih yang paling banyak dipesan pelanggan kami</p>
        </div>
        <div className={styles.carsGrid}>
          {featured.map((car, i) => (
            <div key={car.id} className={styles.carCard} style={{ animationDelay: `${i * 0.15}s` }}>
              {car.tag && <div className={styles.carTag}>{car.tag}</div>}
              <div className={styles.carImageWrap}>
                <img src={car.imageUrl || car.image} alt={car.name} className={styles.carImage} loading="lazy" />
              </div>
              <div className={styles.carInfo}>
                <div className={styles.carCategory}>{car.category}</div>
                <h3 className={styles.carName}>{car.name}</h3>
                <div className={styles.carFeatures}>
                  {car.features.slice(0, 2).map(f => (
                    <span key={f} className={styles.carFeature}>{f}</span>
                  ))}
                </div>
                <div className={styles.carPrice}>
                  <div>
                    <span className={styles.priceLabel}>Mulai dari</span>
                    <span className={styles.priceValue}>{formatPrice(car.pricePerDay)}</span>
                    <span className={styles.priceDay}>/hari</span>
                  </div>
                  <a
                    href={`${waBase}${encodeURIComponent(`Halo, saya ingin booking ${car.name}. Berapa ketersediaannya?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bookBtn}
                  >
                    Booking
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.viewAll}>
          <Link to="/armada" className="btn btn-outline">
            Lihat Semua Armada
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// === TESTIMONIALS ===
function Testimonials() {
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Ahmad Rizki',
      role: 'Pengusaha',
      text: 'Sudah 3 tahun langganan Dearma. Pelayanannya konsisten bagus, mobilnya selalu bersih dan tepat waktu. Sopirnya juga ramah dan profesional.',
      rating: 5,
      avatar: 'A'
    },
    {
      id: 2,
      name: 'Sari Dewi',
      role: 'Ibu Rumah Tangga',
      text: 'Pesan Alphard untuk pernikahan anak, hasilnya luar biasa! Mobilnya mewah dan bersih, sopirnya berpakaian rapi. Terima kasih Dearma!',
      rating: 5,
      avatar: 'S'
    },
    {
      id: 3,
      name: 'Budi Santoso',
      role: 'Manager Perusahaan',
      text: 'Untuk keperluan bisnis dan antar tamu kantor, saya selalu andalkan Dearma. Respon cepat, harga reasonable, dan bisa dipercaya.',
      rating: 5,
      avatar: 'B'
    },
    {
      id: 4,
      name: 'Linda Sihombing',
      role: 'Wisatawan',
      text: 'Sewa Hiace Premio untuk wisata keluarga ke Brastagi. Nyaman banget! Sopirnya tau banyak tempat menarik. Pasti balik lagi!',
      rating: 5,
      avatar: 'L'
    }
  ])

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(6))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }
      } catch (e) {
        // use static data
      }
    }
    fetchTestimonials()
  }, [])

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>Apa Kata Mereka</p>
          <h2 className="section-title">TESTIMONI<br />PELANGGAN</h2>
          <div className="gold-line" />
        </div>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <div key={t.id} className={styles.testimonialCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.stars}>
                {[...Array(t.rating)].map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#c9a227">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>{t.avatar || t.name?.[0]}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// === GOOGLE MAPS SECTION ===
function Location() {
  const { settings } = useSettings()
  
  return (
    <section className={styles.location}>
      <div className="container">
        <div className={styles.locationInner}>
          <div className={styles.locationText}>
            <p className={styles.sectionTag}>Temukan Kami</p>
            <h2 className="section-title">LOKASI<br />KAMI</h2>
            <div className="gold-line" />
            <div className={styles.locationInfo}>
              <div className={styles.locItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>Alamat</strong>
                  <a href={settings.mapsUrl ? (settings.mapsUrl.includes('maps/embed') ? settings.mapsUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapsUrl)}`) : 'https://goo.gl/maps/medan'} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a227', textDecoration: 'underline' }}>
                    {settings.address || 'Jl. Setia Budi No. 123, Medan Selayang, Kota Medan, Sumatera Utara 20131'}
                  </a>
                </div>
              </div>
              <div className={styles.locItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12"/>
                  <path d="M1 1l22 22"/>
                </svg>
                <div>
                  <strong>WhatsApp</strong>
                  <p>{settings.whatsapp ? `+${settings.whatsapp}` : '0812-3456-7890'}</p>
                </div>
              </div>
              <div className={styles.locItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div>
                  <strong>Jam Operasional</strong>
                  <p>Senin - Minggu: 24 Jam</p>
                </div>
              </div>
            </div>
            <a
              href={settings.mapsUrl || 'https://goo.gl/maps/medan'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ marginTop: '24px', display: 'inline-flex' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Buka di Google Maps
            </a>
          </div>
          <div className={styles.mapContainer}>
            <iframe
              title="Lokasi Dearma Sewa Mobil Medan"
              src={settings.mapsUrl?.includes('maps/embed') ? settings.mapsUrl : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127620.55596369584!2d98.61496427285156!3d3.5896654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3031741c9af9f7bf%3A0x38d6e2a97c26a9e0!2sMedan%2C%20Kota%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid'}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// === ARTICLES PREVIEW ===
function ArticlesPreview() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(3))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } else {
          setArticles([
            { id: '1', title: 'Tips Memilih Rental Mobil Terpercaya di Medan', excerpt: 'Panduan lengkap untuk memilih jasa rental mobil yang aman, terpercaya, dan sesuai budget Anda di kota Medan.', category: 'Tips', date: '2024-01-15' },
            { id: '2', title: 'Destinasi Wisata Terbaik Sumatera Utara dengan Mobil Rental', excerpt: 'Jelajahi keindahan Danau Toba, Brastagi, dan destinasi lainnya dengan nyaman menggunakan mobil rental.', category: 'Wisata', date: '2024-01-10' },
            { id: '3', title: 'Keuntungan Sewa Mobil dengan Sopir vs Lepas Kunci', excerpt: 'Pertimbangkan keuntungan dan kekurangan sewa mobil dengan sopir dan tanpa sopir sebelum memutuskan.', category: 'Info', date: '2024-01-05' }
          ])
        }
      } catch (e) {
        setArticles([
          { id: '1', title: 'Tips Memilih Rental Mobil Terpercaya di Medan', excerpt: 'Panduan lengkap untuk memilih jasa rental mobil yang aman, terpercaya, dan sesuai budget Anda di kota Medan.', category: 'Tips', date: '2024-01-15' },
          { id: '2', title: 'Destinasi Wisata Terbaik Sumatera Utara dengan Mobil Rental', excerpt: 'Jelajahi keindahan Danau Toba, Brastagi, dan destinasi lainnya dengan nyaman menggunakan mobil rental.', category: 'Wisata', date: '2024-01-10' },
          { id: '3', title: 'Keuntungan Sewa Mobil dengan Sopir vs Lepas Kunci', excerpt: 'Pertimbangkan keuntungan dan kekurangan sewa mobil dengan sopir dan tanpa sopir sebelum memutuskan.', category: 'Info', date: '2024-01-05' }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  return (
    <section className={styles.articlesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTag}>Blog & Tips</p>
          <h2 className="section-title">ARTIKEL<br />TERBARU</h2>
          <div className="gold-line" />
        </div>
        <div className={styles.articlesGrid}>
          {articles.map((a, i) => (
            <Link to={`/artikel/${a.id}`} key={a.id} className={styles.articleCard} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={styles.articleCategory}>{a.category}</div>
              <h3 className={styles.articleTitle}>{a.title}</h3>
              <p className={styles.articleExcerpt}>{a.excerpt}</p>
              <div className={styles.articleFooter}>
                <span className={styles.articleDate}>{a.date}</span>
                <span className={styles.articleRead}>Baca →</span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.viewAll}>
          <Link to="/artikel" className="btn btn-outline">
            Lihat Semua Artikel
          </Link>
        </div>
      </div>
    </section>
  )
}

// === CTA SECTION ===
function CTA() {
  const { settings } = useSettings()
  const waNumber = settings.whatsapp || '6281234567890'
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Dearma, saya ingin konsultasi tentang rental mobil')}`
  return (
    <section className={styles.cta}>
      <div className={styles.ctaOrb1} />
      <div className={styles.ctaOrb2} />
      <div className="container">
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>SIAP UNTUK<br />PERJALANAN TERBAIK?</h2>
          <p className={styles.ctaDesc}>Hubungi kami sekarang dan dapatkan penawaran terbaik untuk rental mobil impian Anda.</p>
          <div className={styles.ctaBtns}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Chat WhatsApp
            </a>
            <a href="tel:+6281234567890" className="btn btn-outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.96-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Telepon Kami
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// === SOCIAL SECTION ===
function Social() {
  return (
    <section className={styles.social}>
      <div className="container">
        <div className={styles.socialGrid}>
          <a
            href="https://www.instagram.com/dearmasewamobil"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialCard} ${styles.instagram}`}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeLinecap="round" strokeWidth="3"/>
            </svg>
            <div>
              <h3>Follow Instagram</h3>
              <p>@dearmasewamobil</p>
            </div>
            <div className={styles.socialArrow}>→</div>
          </a>
          <a
            href="https://www.facebook.com/dearmasewamobil"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialCard} ${styles.facebook}`}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            <div>
              <h3>Like Facebook</h3>
              <p>Dearma Sewa Mobil Medan</p>
            </div>
            <div className={styles.socialArrow}>→</div>
          </a>
        </div>
      </div>
    </section>
  )
}

// === MAIN HOME PAGE ===
export default function Home() {
  return (
    <>
      <Helmet>
        <title>Dearma Sewa Mobil Medan | Rental Mobil Premium & Terpercaya</title>
        <meta name="description" content="Dearma Sewa Mobil Medan - Rental mobil premium dengan armada lengkap: Alphard, Fortuner, Innova Zenix, Hiace Premio, Pajero Sport, Avanza. Harga terbaik, sopir profesional, layanan 24 jam." />
      </Helmet>
      <Hero />
      <Features />
      <FeaturedCars />
      <Testimonials />
      <Location />
      <ArticlesPreview />
      <CTA />
      <Social />
    </>
  )
}
