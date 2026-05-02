import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSettings } from '../context/SettingsContext'
import styles from './TourDetail.module.css'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const MONTHS_S = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const MONTHS_F = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

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

function Stars({ n = 5, size = 14 }) {
  return (
    <span style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#E8A020' : '#D1D5DB' }}>★</span>
      ))}
    </span>
  )
}

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState(null)
  const [otherTours, setOtherTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('informasi')
  const [galIdx, setGalIdx] = useState(0)
  const [faqOpen, setFaqOpen] = useState(null)
  const [copied, setCopied] = useState(false)
  const [selectedPaxIdx, setSelectedPaxIdx] = useState(0)
  const { settings } = useSettings()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'tours', id))
        if (docSnap.exists()) {
          setTour({ id: docSnap.id, ...docSnap.data() })
        } else {
          navigate('/paket-wisata')
          return
        }
        const snap = await getDocs(collection(db, 'tours'))
        setOtherTours(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.id !== id).slice(0, 3))
      } catch { navigate('/paket-wisata') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id, navigate])

  const waNumber = settings.whatsapp || '6281234567890'
  const tripUrl  = window.location.href

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <span>Memuat detail paket…</span>
      </div>
    )
  }
  if (!tour) return null

  // ----- Helpers -----
  const paxList     = tour.paxPricing || []
  const selPax      = paxList[selectedPaxIdx]
  const selPrice    = selPax ? (selPax.price || selPax.totalPrice || 0) : (tour.price || 0)
  const destName    = DESTINATIONS.find(d => d.id === tour.destination)?.name
  const heroImg     = tour.heroImage || tour.imageUrl || ''
  const gallery     = tour.gallery?.filter(Boolean) || []
  const hasJadwal   = tour.type === 'open' && tour.jadwal && Object.keys(tour.jadwal).length > 0

  // WhatsApp booking message
  const waBookText = encodeURIComponent(
    `Halo Dearma, saya tertarik dengan paket tour *${tour.name}*.\n` +
    `Durasi: ${tour.duration || '-'}\n` +
    (selPax ? `Pax: ${selPax.label || selPax.pax + ' Orang'}\n` +
               `Jenis Mobil: ${selPax.carType || '-'}\n` +
               `Harga: ${fmt(selPrice)}\n` : '') +
    `\nDetail: ${tripUrl}\n\n*Mohon diisi:*\nNama:\nJumlah peserta:\nTanggal tour:`
  )
  const waBookUrl  = `https://wa.me/${waNumber}?text=${waBookText}`
  const waTanyaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Dearma! Saya ingin tanya tentang paket tour *${tour.name}*.`)}`

  // share helpers
  const fbShareUrl    = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}`
  const waShareUrl    = `https://wa.me/?text=${encodeURIComponent(`Halo, cek paket tour *${tour.name}* dari Dearma: ${tripUrl}`)}`
  const emailShareUrl = `mailto:?subject=${encodeURIComponent('Paket Tour: ' + tour.name)}&body=${encodeURIComponent(`Halo,\n\nSaya ingin berbagi info paket tour:\n${tour.name}\n${tripUrl}`)}`

  const copyLink = () => {
    navigator.clipboard.writeText(tripUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  // Tabs definition
  const TABS = [
    { key: 'informasi', label: 'Informasi' },
    { key: 'itinerary', label: 'Itinerary', hide: !tour.itinerary },
    { key: 'catatan',   label: 'Catatan',   hide: !tour.notes },
    { key: 'ulasan',    label: 'Ulasan',    hide: !tour.ulasan?.length },
    { key: 'lokasi',    label: 'Lokasi' },
    { key: 'faq',       label: 'FAQ',       hide: !tour.faq },
  ].filter(t => !t.hide)

  const parsedIncluded    = (tour.included  || '').split('\n').filter(Boolean)
  const parsedExcluded    = (tour.excluded  || '').split('\n').filter(Boolean)
  const parsedNotes       = (tour.notes     || '').split('\n').filter(Boolean)

  // Display itinerary as HTML content
  const itineraryHtml = tour.itinerary || ''

  const parsedFaq         = (tour.faq       || '').split('\n').filter(Boolean)

  return (
    <>
      <Helmet>
        <title>{tour.name} | Dearma Tour</title>
        <meta name="description" content={tour.description?.slice(0,160) || `Paket tour ${tour.name}`} />
      </Helmet>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {heroImg
          ? <img src={heroImg} alt={tour.name} className={styles.heroImg} />
          : <div className={styles.heroPlaceholder}><span>🗺</span></div>
        }
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadLink}>Beranda</Link>
            <span className={styles.breadSep}>/</span>
            <Link to="/paket-wisata" className={styles.breadLink}>Paket Wisata</Link>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>{tour.name}</span>
          </div>
          <div className={styles.heroBadges}>
            {tour.type && (
              <span className={`${styles.typeBadge} ${tour.type === 'open' ? styles.typeOpen : styles.typePrivate}`}>
                {tour.type === 'open' ? '🔓 Open Trip' : '🔒 Private Trip'}
              </span>
            )}
            {tour.duration && (
              <span className={styles.durBadge}>⏱ {tour.duration}</span>
            )}
          </div>
          <h1 className={styles.heroTitle}>{tour.name}</h1>
          {destName && <div className={styles.heroDestRow}>📍 {destName}</div>}
        </div>
      </section>

      {/* ── TAB BAR ── */}
      <div className={styles.tabBar}>
        <div className={styles.tabContainer}>
          {TABS.map(t => (
            <button key={t.key}
              className={`${styles.tabBtn} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <section className={styles.body}>
        <div className={styles.bodyContainer}>
          {/* ── MAIN CONTENT ── */}
          <div className={styles.mainCol}>

            {/* INFORMASI */}
            {tab === 'informasi' && (
              <div>
                <h2 className={styles.sectionTitle}>Tentang Paket Ini</h2>
                {tour.description && (
                  <p className={styles.description}>{tour.description}</p>
                )}

                {/* Gallery */}
                {gallery.length > 0 && (
                  <div className={styles.gallery}>
                    <div className={styles.galleryMain}>
                      <img src={gallery[galIdx]} alt="gallery" className={styles.galleryMainImg} />
                      {gallery.length > 1 && (
                        <>
                          <button className={styles.galPrev} onClick={() => setGalIdx(i => (i - 1 + gallery.length) % gallery.length)}>‹</button>
                          <button className={styles.galNext} onClick={() => setGalIdx(i => (i + 1) % gallery.length)}>›</button>
                        </>
                      )}
                    </div>
                    {gallery.length > 1 && (
                      <div className={styles.galleryThumbs}>
                        {gallery.map((img, i) => (
                          <div key={i} onClick={() => setGalIdx(i)}
                            className={`${styles.galleryThumb} ${galIdx === i ? styles.galleryThumbActive : ''}`}>
                            <img src={img} alt="" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Include / Exclude */}
                {(parsedIncluded.length > 0 || parsedExcluded.length > 0) && (
                  <div className={styles.inclGrid}>
                    {parsedIncluded.length > 0 && (
                      <div className={styles.inclBox}>
                        <h3 className={styles.inclTitle}>✅ Termasuk</h3>
                        {parsedIncluded.map((x, i) => (
                          <div key={i} className={styles.inclItem}>
                            <span className={styles.inclDotGreen}>•</span>{x}
                          </div>
                        ))}
                      </div>
                    )}
                    {parsedExcluded.length > 0 && (
                      <div className={styles.exclBox}>
                        <h3 className={styles.exclTitle}>❌ Tidak Termasuk</h3>
                        {parsedExcluded.map((x, i) => (
                          <div key={i} className={styles.inclItem}>
                            <span className={styles.inclDotRed}>•</span>{x}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ITINERARY */}
            {tab === 'itinerary' && (
              <div>
                <h2 className={styles.sectionTitle}>Itinerary Perjalanan</h2> {/* Fixed JSX structure */}
                <div className={styles.itineraryContent} dangerouslySetInnerHTML={{ __html: itineraryHtml }} />

                {/* Jadwal tabel (open trip only) */}
                {hasJadwal && (
                  <div style={{ marginTop: '2.5rem' }}>
                    <h3 className={styles.sectionSubTitle}>📅 Jadwal Open Trip</h3>
                    <div className={styles.jadwalWrap}>
                      <table className={styles.jadwalTable}>
                        <thead>
                          <tr>
                            {MONTHS_S.map(m => <th key={m}>{MONTHS_F[MONTHS_S.indexOf(m)]}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {[0,1,2,3,4].map(ri => (
                            <tr key={ri}>
                              {MONTHS_S.map(m => {
                                const dates = tour.jadwal[m] || []
                                return (
                                  <td key={m} className={dates[ri] ? styles.jadwalActive : ''}>
                                    {dates[ri] || '—'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
              </div>
            )}

            {/* CATATAN */}
            {tab === 'catatan' && (
              <div>
                <h2 className={styles.sectionTitle}>Catatan Penting</h2>
                <div className={styles.notesBox}>
                  {parsedNotes.map((n, i) => (
                    <div key={i} className={styles.notesItem}>
                      <span className={styles.notesIcon}>⚠</span><span>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ULASAN */}
            {tab === 'ulasan' && (
              <div>
                <h2 className={styles.sectionTitle}>Ulasan Peserta</h2>
                {(!tour.ulasan || tour.ulasan.length === 0)
                  ? <p className={styles.emptyText}>Belum ada ulasan.</p>
                  : tour.ulasan.map((u, i) => (
                    <div key={i} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div>
                          <div className={styles.reviewName}>{u.nama || u.name}</div>
                          <Stars n={u.rating} />
                        </div>
                        <div className={styles.reviewDate}>{u.tanggal || u.date}</div>
                      </div>
                      <p className={styles.reviewText}>{u.komentar || u.comment}</p>
                    </div>
                  ))
                }
              </div>
            )}

            {/* LOKASI */}
            {tab === 'lokasi' && (
              <div>
                <h2 className={styles.sectionTitle}>Lokasi</h2>
                {tour.location && <p className={styles.locationText}>📍 {tour.location}</p>}
                {tour.lokasi_embed
                  ? <iframe src={tour.lokasi_embed} width="100%" height="400"
                      style={{ border: 0, borderRadius: 16, marginTop: '1rem' }}
                      allowFullScreen loading="lazy" title="map" />
                  : <div className={styles.mapPlaceholder}>Peta belum tersedia</div>
                }
              </div>
            )}

            {/* FAQ */}
            {tab === 'faq' && (
              <div>
                <h2 className={styles.sectionTitle}>FAQ</h2>
                {parsedFaq.map((q, i) => (
                  <div key={i} className={styles.faqItem}>
                    <div onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className={styles.faqQ}>
                      <span>{i+1}. {q}</span>
                      <span className={`${styles.faqArrow} ${faqOpen === i ? styles.faqArrowOpen : ''}`}>⌄</span>
                    </div>
                    {faqOpen === i && (
                      <div className={styles.faqA}>Hubungi kami via WhatsApp untuk jawaban lengkap.</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Related tours */}
            {otherTours.length > 0 && (
              <div className={styles.relatedWrap}>
                <h3 className={styles.sectionSubTitle}>Paket Tour Lainnya</h3>
                {otherTours.map(t => (
                  <Link key={t.id} to={`/paket-wisata/${t.id}`} className={styles.relatedCard}>
                    {(t.heroImage || t.imageUrl) && (
                      <img src={t.heroImage || t.imageUrl} alt={t.name} className={styles.relatedImg} />
                    )}
                    <div className={styles.relatedInfo}>
                      <div className={styles.relatedName}>{t.name}</div>
                      <div className={styles.relatedPrice}>
                        Mulai {fmt(Math.min(...(t.paxPricing?.map(p => p.price || p.totalPrice || 0) || [t.price || 0])))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              {/* Pax selector */}
              {paxList.length > 0 && (
                <div className={styles.paxSection}>
                  <div className={styles.sidebarLabel}>Pilih Jumlah Pax</div>
                  <div className={styles.paxList}>
                    {paxList.map((p, i) => (
                      <div key={i} onClick={() => setSelectedPaxIdx(i)}
                        className={`${styles.paxRow} ${selectedPaxIdx === i ? styles.paxRowActive : ''}`}>
                        <div className={styles.paxRowLeft}>
                          <div className={styles.paxLabel}>{p.label || `${p.pax} Pax`}</div>
                          {p.carType && <div className={styles.paxCarType}>{p.carType}</div>}
                        </div>
                        <div className={styles.paxPrice}>{fmt(p.price || p.totalPrice || 0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.sidebarPriceLabel}>Harga per orang</div>
              <div className={styles.sidebarPrice}>{fmt(selPrice)}</div>

              <a href={waBookUrl} target="_blank" rel="noopener noreferrer" className={styles.bookBtn}>
                💬 Book via WhatsApp
              </a>
              <a href={waTanyaUrl} target="_blank" rel="noopener noreferrer" className={styles.askBtn}>
                Tanya Dulu
              </a>

              {/* Share */}
              <div className={styles.shareWrap}>
                <div className={styles.shareLabel}>Bagikan Paket Ini</div>
                <div className={styles.shareRow}>
                  <a href={waShareUrl} target="_blank" rel="noopener noreferrer"
                    className={styles.shareBtn} style={{ background: '#25D366' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                  <a href={fbShareUrl} target="_blank" rel="noopener noreferrer"
                    className={styles.shareBtn} style={{ background: '#1877F2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a href={emailShareUrl}
                    className={styles.shareBtn} style={{ background: '#EA4335' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    Email
                  </a>
                  <button onClick={copyLink}
                    className={styles.shareBtn}
                    style={{ background: copied ? '#2ECC71' : '#6B7280', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    {copied ? 'Disalin!' : 'Salin Link'}
                  </button>
                </div>
              </div>

              {/* Trip info */}
              <div className={styles.tripMeta}>
                {tour.duration && (
                  <div className={styles.tripMetaRow}>
                    <span>⏱ Durasi</span><strong>{tour.duration}</strong>
                  </div>
                )}
                {selPax && (
                  <div className={styles.tripMetaRow}>
                    <span>👥 Pax</span><strong>{selPax.label || selPax.pax + ' Orang'}</strong>
                  </div>
                )}
                {destName && (
                  <div className={styles.tripMetaRow}>
                    <span>🗺 Dest</span><strong>{destName}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky bottom bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarPrice}>
          <div className={styles.mobileBarLabel}>Mulai dari</div>
          <div className={styles.mobileBarVal}>{fmt(selPrice)}</div>
        </div>
        <a href={waBookUrl} target="_blank" rel="noopener noreferrer" className={styles.mobileBarBtn}>
          💬 Book WhatsApp
        </a>
      </div>
    </>
  )
}
