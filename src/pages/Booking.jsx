import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import styles from './Booking.module.css'

// ── Firebase bookingdearma (data menuju admin booking) ──────────────────────
const BOOKING_FIREBASE_CONFIG = {
  apiKey:            'AIzaSyD6fkQ5vi7JgBAEVkJ8LREc9ptdvtB_jZg',
  authDomain:        'bookingdearma-cec07.firebaseapp.com',
  projectId:         'bookingdearma-cec07',
  storageBucket:     'bookingdearma-cec07.firebasestorage.app',
  messagingSenderId: '528250267544',
  appId:             '1:528250267544:web:440799d8bd3fd1e46b6ded',
}
const WA_NUMBER = '62818520057'

// Init Firebase (avoid duplicate app)
const bookingApp = getApps().find(a => a.name === 'bookingdearma')
  || initializeApp(BOOKING_FIREBASE_CONFIG, 'bookingdearma')
const db = getFirestore(bookingApp)

// ── Image base URL (public R2) ──────────────────────────────────────────────
const IMG_BASE = 'https://pub-319b1e00f3724892a5f2795a950feb77.r2.dev'

// ── Default car catalog (fallback jika Firestore offline) ──────────────────
const DEFAULT_CARS = {
  avanza:         { label: 'New Avanza 2024',    price: 350000,  priceAllin: 450000,  img: '1000537007.png', seats: 7,  category: 'MPV' },
  innova_reborn:  { label: 'Innova Reborn',      price: 500000,  priceAllin: 650000,  img: '1000537006.jpg', seats: 7,  category: 'MPV Premium' },
  innova_zenix:   { label: 'Innova Zenix',       price: 550000,  priceAllin: 700000,  img: '1000537006.jpg', seats: 7,  category: 'MPV Premium' },
  fortuner:       { label: 'Fortuner 2024',      price: 750000,  priceAllin: 950000,  img: '1000537008.jpg', seats: 7,  category: 'SUV' },
  pajero:         { label: 'Pajero Sport 2024',  price: 800000,  priceAllin: 1000000, img: '1000537014.jpg', seats: 7,  category: 'SUV' },
  alphard_2023:   { label: 'Alphard 2023',       price: 1500000, priceAllin: 1800000, img: '1000537012.jpg', seats: 7,  category: 'Luxury MPV' },
  alphard_2025:   { label: 'New Alphard 2025',   price: 1800000, priceAllin: 2100000, img: '1000537013.jpg', seats: 7,  category: 'Luxury MPV' },
  hiace_commuter: { label: 'Hiace Commuter',     price: 900000,  priceAllin: 1100000, img: '1000537011.jpg', seats: 12, category: 'Minibus' },
  hiace_premio:   { label: 'Hiace Premio',       price: 1100000, priceAllin: 1350000, img: '1000537010.jpg', seats: 10, category: 'Luxury Minibus' },
}

// Mapping: ID dari Fleet website → ID di bookingdearma
const CAR_ID_MAP = {
  'avanza':      'avanza',
  'innova-zenix':'innova_zenix',
  'fortuner':    'fortuner',
  'pajero':      'pajero',
  'alphard':     'alphard_2023',
  'alphard-hev': 'alphard_2025',
  'hiace':       'hiace_commuter',
  'hiace-premio':'hiace_premio',
}

const fmt = n => 'Rp ' + Number(n).toLocaleString('id-ID')
const fmtD = v => {
  if (!v) return '-'
  const d = new Date(v + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
const genId = () => {
  const n = new Date()
  return `DZ${n.getFullYear()}${String(n.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export default function Booking() {
  const [searchParams] = useSearchParams()

  // State
  const [cars, setCars]           = useState(DEFAULT_CARS)
  const [loadingCars, setLoadingCars] = useState(true)
  const [selCar, setSelCar]       = useState('')
  const [dMode, setDMode]         = useState(0)   // 0=driver, 1=self, 2=allin
  const [bType, setBType]         = useState(0)   // 0=rental, 1=airport

  // Form fields
  const [nama, setNama]     = useState('')
  const [wa, setWa]         = useState('')
  const [email, setEmail]   = useState('')
  const [ktp, setKtp]       = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [waktu, setWaktu]   = useState('08:00')
  const [lokasi, setLokasi] = useState('')
  const [alamat, setAlamat] = useState('')
  const [catatan, setCatatan] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastId, setLastId]   = useState(null)
  const [copied, setCopied]   = useState(false)
  const [estInfo, setEstInfo] = useState(null)

  // ── Load cars dari Firestore ──────────────────────────────────────────────
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
        const snap = await Promise.race([getDoc(doc(db, 'settings', 'cars')), timeout])
        if (snap.exists()) {
          const data = snap.data()
          Object.keys(data).forEach(k => { if (!data[k].img) data[k].img = DEFAULT_CARS[k]?.img || '1000537007.png' })
          setCars(data)
        }
      } catch {
        // pakai DEFAULT_CARS
      } finally {
        setLoadingCars(false)
      }
    }
    fetchCars()
  }, [])

  // ── Pre-select car dari URL param ─────────────────────────────────────────
  useEffect(() => {
    if (loadingCars) return
    const paramCar = searchParams.get('car')
    if (paramCar) {
      const mapped = CAR_ID_MAP[paramCar] || paramCar
      if (cars[mapped]) { setSelCar(mapped); return }
    }
    setSelCar(Object.keys(cars)[0])
  }, [loadingCars, searchParams, cars])

  // ── Hitung estimasi ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selCar || !startDate) { setEstInfo(null); return }
    if (bType === 0 && !endDate) { setEstInfo(null); return }
    const days = bType === 1 ? 1 : Math.max(1, Math.ceil(
      (new Date(endDate + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / 86400000
    ) + 1)
    const c = cars[selCar]
    if (!c) { setEstInfo(null); return }
    const harga = bType === 1
      ? (c.priceAirport || c.price)
      : (dMode === 2 && c.priceAllin ? c.priceAllin : c.price)
    setEstInfo({ days, harga, total: harga * days })
  }, [selCar, startDate, endDate, bType, dMode, cars])

  // ── Submit booking ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!selCar) return
    setSubmitting(true)

    const en = bType === 1 ? startDate : endDate
    const days = bType === 1 ? 1 : Math.max(1, Math.ceil(
      (new Date(en + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / 86400000
    ) + 1)
    if (bType === 0 && days <= 0) {
      alert('Tanggal pengembalian harus setelah tanggal penjemputan!')
      setSubmitting(false)
      return
    }

    const c = cars[selCar]
    const harga = bType === 1 ? (c.priceAirport || c.price) : (dMode === 2 && c.priceAllin ? c.priceAllin : c.price)
    const lokasiLengkap = lokasi === 'Kota Medan' && alamat ? `${lokasi} - ${alamat}` : lokasi
    const tipeDriver = bType === 1 ? 'airport' : dMode === 0 ? 'driver' : dMode === 1 ? 'selfDrive' : 'allinKota'

    const bk = {
      id: genId(),
      createdAt: new Date().toISOString(),
      nama, wa, email, ktp,
      tipePesanan: bType === 1 ? 'airport' : 'rental',
      car: selCar, carLabel: c.label,
      withDriver: bType === 1 ? true : dMode === 0,
      tipeDriver,
      startDate, endDate: en, waktu,
      lokasi: lokasiLengkap, catatan: catatan || '-',
      days, carPrice: harga, totalPrice: harga * days,
      status: 'pending', paymentStatus: 'unpaid',
      driverName: '', driverPhone: '', vehiclePlate: '',
      paymentMethod: '', invoiceUrl: '', invoiceKey: '',
      carPhotos: [], carPhotoKeys: [],
      confirmedAt: null, completedAt: null,
    }

    try { await setDoc(doc(db, 'bookings', bk.id), bk) }
    catch { /* simpan lokal jika offline */ }

    const tipeLbl = bType === 1 ? '✈️ Airport Transfer'
      : dMode === 2 ? 'Mobil Supir All In (BBM+Makan)'
      : dMode === 0 ? 'Dengan Supir' : 'Lepas Kunci'

    const trackLink = `https://bookingdearma.vercel.app/tracking?id=${bk.id}`
    const msg =
`🚗 *BOOKING BARU — Dearma Jaya Transport*
━━━━━━━━━━━━━━━━━━━━━
🔖 *ID: ${bk.id}*

👤 *DATA PENYEWA*
• Nama     : ${bk.nama}
• WA       : ${bk.wa}
• Email    : ${bk.email || '-'}
• KTP/SIM  : ${bk.ktp || '-'}

🚙 *KENDARAAN*
• Mobil    : ${bk.carLabel}
• Layanan  : ${tipeLbl}

📅 *DETAIL SEWA*
• Mulai    : ${fmtD(startDate)} pukul ${waktu}
• Selesai  : ${fmtD(en)}
• Durasi   : ${days} hari
• Lokasi   : ${lokasiLengkap}

💰 *ESTIMASI BIAYA*
• ${fmt(harga)} × ${days} hari = *${fmt(harga * days)}*

📝 Catatan: ${bk.catatan}
🔗 Tracking: ${trackLink}
━━━━━━━━━━━━━━━━━━━━━`

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    setLastId(bk.id)
    setShowSuccess(true)
    setSubmitting(false)

    // Reset form
    setNama(''); setWa(''); setEmail(''); setKtp('')
    setStartDate(''); setEndDate(''); setWaktu('08:00')
    setLokasi(''); setAlamat(''); setCatatan('')
    setDMode(0); setBType(0)
  }, [selCar, bType, dMode, startDate, endDate, waktu, lokasi, alamat, catatan, nama, wa, email, ktp, cars])

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Helmet>
        <title>Booking Rental Mobil Medan | Dearma Sewa Mobil</title>
        <meta name="description" content="Booking rental mobil Medan online. Toyota Alphard, Fortuner, Innova Zenix, Hiace Premio, Avanza. Airport transfer Kualanamu. Konfirmasi cepat via WhatsApp." />
      </Helmet>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <p className={styles.heroTag}>Form Pemesanan Online</p>
          <h1 className={styles.heroTitle}>BOOKING<br />SEKARANG</h1>
          <div className={styles.goldLine} />
          <p className={styles.heroSub}>Rental Harian & Airport Transfer • Kualanamu • Medan</p>
        </div>
      </section>

      {/* ── Form ── */}
      <section className={styles.formSection}>
        <div className={styles.formWrap}>
          <form onSubmit={handleSubmit} className={styles.card}>

            {/* ── Data Penyewa ── */}
            <div className={styles.secLabel}>👤 Data Penyewa</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nama Lengkap *</label>
                <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Budi Santoso" required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>No. WhatsApp *</label>
                <input value={wa} onChange={e => setWa(e.target.value)} type="tel" placeholder="08xxxxxxxxxx" required />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@contoh.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>No. KTP / SIM</label>
                <input value={ktp} onChange={e => setKtp(e.target.value)} placeholder="3271xxxxxxxxxxxxxxx" />
              </div>
            </div>

            <hr className={styles.divider} />

            {/* ── Tipe Layanan ── */}
            <div className={styles.secLabel}>📋 Tipe Layanan</div>
            <div className={styles.togRow}>
              <button type="button" className={`${styles.togBtn} ${bType === 0 ? styles.togOn : ''}`}
                onClick={() => setBType(0)}>🚗 Rental Harian</button>
              <button type="button" className={`${styles.togBtn} ${bType === 1 ? styles.togOn : ''}`}
                onClick={() => setBType(1)}>✈️ Airport Transfer</button>
            </div>
            {bType === 1 && (
              <div className={styles.infoBox}>
                ✈️ <strong>Airport Transfer</strong> — Harga flat per trip. Tidak dihitung per hari.
              </div>
            )}

            <hr className={styles.divider} />

            {/* ── Pilih Kendaraan ── */}
            <div className={styles.secLabel}>🚙 Pilih Kendaraan</div>
            {loadingCars ? (
              <div className={styles.loadingCars}>Memuat kendaraan…</div>
            ) : (
              <div className={styles.carGrid}>
                {Object.entries(cars).map(([key, c]) => {
                  const price = bType === 1
                    ? (c.priceAirport || c.price)
                    : (dMode === 2 && c.priceAllin ? c.priceAllin : c.price)
                  const unit = bType === 1 ? '/trip' : '/hari'
                  const imgSrc = c.img
                    ? (c.img.startsWith('http') ? c.img : `${IMG_BASE}/${c.img}`)
                    : `${IMG_BASE}/1000537007.png`
                  return (
                    <div
                      key={key}
                      className={`${styles.carCard} ${selCar === key ? styles.carSel : ''}`}
                      onClick={() => setSelCar(key)}
                    >
                      <img src={imgSrc} alt={c.label} className={styles.carImg} loading="lazy" />
                      <div className={styles.carName}>{c.label}</div>
                      <div className={styles.carPrice}>{fmt(price)}<span>{unit}</span></div>
                    </div>
                  )
                })}
              </div>
            )}

            <hr className={styles.divider} />

            {/* ── Detail Sewa ── */}
            <div className={styles.secLabel}>📅 Detail Sewa</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tanggal Penjemputan *</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={today} required />
              </div>
              {bType === 0 && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tanggal Pengembalian *</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || today} required={bType === 0} />
                </div>
              )}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Jam Penjemputan</label>
                <input type="time" value={waktu} onChange={e => setWaktu(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Lokasi Penjemputan *</label>
                <select value={lokasi} onChange={e => { setLokasi(e.target.value); if (e.target.value !== 'Kota Medan') setAlamat('') }} required>
                  <option value="">-- Pilih Lokasi --</option>
                  <option value="Bandara Kualanamu">Bandara Kualanamu International Airport</option>
                  <option value="Kota Medan">Kota Medan</option>
                </select>
              </div>
            </div>
            {lokasi === 'Kota Medan' && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Alamat Penjemputan *</label>
                <textarea value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Masukkan alamat lengkap…" required />
              </div>
            )}

            {/* ── Tipe Supir ── */}
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.fieldLabel}>Tipe Layanan Supir</label>
              <div className={styles.togRow}>
                <button type="button" className={`${styles.togBtn} ${dMode === 0 ? styles.togOn : ''}`}
                  onClick={() => setDMode(0)}>🧑‍✈️ Dengan Supir</button>
                <button type="button" className={`${styles.togBtn} ${dMode === 1 ? styles.togOn : ''}`}
                  onClick={() => setDMode(1)}>🔑 Lepas Kunci</button>
                <button type="button" className={`${styles.togBtn} ${dMode === 2 ? styles.togOn : ''}`}
                  onClick={() => setDMode(2)}>🏙️ All In Dalam Kota</button>
              </div>
            </div>
            {dMode === 2 && (
              <div className={styles.allinBox}>
                <div className={styles.allinTitle}>🏙️ Sudah Termasuk:</div>
                <div className={styles.allinItem}>✓ Mobil &amp; Supir</div>
                <div className={styles.allinItem}>✓ BBM (Bahan Bakar Minyak)</div>
                <div className={styles.allinItem}>✓ Makan Supir</div>
              </div>
            )}

            {/* ── Catatan ── */}
            <div className={styles.field} style={{ marginTop: '14px' }}>
              <label className={styles.fieldLabel}>Catatan Tambahan</label>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
                placeholder="Misalnya: perlu baby seat, tujuan luar kota, dsb…" />
            </div>

            {/* ── Estimasi ── */}
            {estInfo && (
              <div className={styles.estBox}>
                <div className={styles.estLabel}>Estimasi Biaya</div>
                <div className={styles.estTotal}>{fmt(estInfo.total)}</div>
                <div className={styles.estDet}>
                  {bType === 1
                    ? `✈️ Airport Transfer • flat ${fmt(estInfo.harga)}/trip`
                    : `${dMode === 2 ? '🏙️ All In' : dMode === 0 ? '🧑‍✈️ Dengan Supir' : '🔑 Lepas Kunci'} • ${estInfo.days} hari × ${fmt(estInfo.harga)}/hari`}
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            <button type="submit" className={styles.submitBtn} disabled={submitting || !selCar}>
              {submitting
                ? <><span className={styles.spin} /> Menyimpan…</>
                : '🚀 PESAN SEKARANG → KIRIM KE WHATSAPP'}
            </button>
          </form>

          {/* ── Info bantuan ── */}
          <div className={styles.helpBox}>
            <p>Butuh bantuan? Hubungi kami langsung via WhatsApp</p>
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Dearma, saya ingin bertanya tentang rental mobil')}`}
              target="_blank" rel="noopener noreferrer" className={styles.helpBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Chat WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Success Overlay ── */}
      {showSuccess && (
        <div className={styles.overlay}>
          <div className={styles.okBox}>
            <div className={styles.okIcon}>✅</div>
            <div className={styles.okTitle}>BOOKING TERKIRIM!</div>
            <p className={styles.okDesc}>
              Pesanan berhasil dibuat &amp; pesan WA sudah dikirim.<br />
              Simpan ID pesanan untuk tracking status.
            </p>
            <div className={styles.idBox}>
              <div className={styles.idLabel}>ID PESANAN</div>
              <div className={styles.idVal}>{lastId}</div>
            </div>
            <a
              href={`https://bookingdearma.vercel.app/tracking?id=${lastId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.okBtn} ${styles.okBtnPrimary}`}
            >
              🔍 Lihat Status Pesanan →
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(`https://bookingdearma.vercel.app/tracking?id=${lastId}`).then(() => setCopied(true)) }}
              className={`${styles.okBtn} ${styles.okBtnOutline}`}
            >
              {copied ? '✅ Link Tersalin!' : '📋 Salin Link Tracking'}
            </button>
            <button
              onClick={() => { setShowSuccess(false); setCopied(false) }}
              className={`${styles.okBtn} ${styles.okBtnGhost}`}
            >
              Buat Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </>
  )
}
