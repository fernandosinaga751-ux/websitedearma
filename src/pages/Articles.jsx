import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from './Articles.module.css'

const STATIC_ARTICLES = [
  { id: '1', title: 'Tips Memilih Rental Mobil Terpercaya di Medan', excerpt: 'Panduan lengkap untuk memilih jasa rental mobil yang aman, terpercaya, dan sesuai budget Anda di kota Medan.', category: 'Tips', date: '15 Jan 2024', readTime: '4 menit' },
  { id: '2', title: 'Destinasi Wisata Terbaik Sumatera Utara dengan Mobil Rental', excerpt: 'Jelajahi keindahan Danau Toba, Brastagi, Parapat, dan destinasi wisata lainnya di Sumatera Utara dengan nyaman menggunakan mobil rental dari Dearma.', category: 'Wisata', date: '10 Jan 2024', readTime: '6 menit' },
  { id: '3', title: 'Keuntungan Sewa Mobil dengan Sopir vs Lepas Kunci', excerpt: 'Pertimbangkan keuntungan dan kekurangan sewa mobil dengan sopir dan lepas kunci sebelum memutuskan pilihan terbaik untuk perjalanan Anda.', category: 'Info', date: '5 Jan 2024', readTime: '5 menit' },
  { id: '4', title: 'Rute Wisata Medan - Danau Toba PP yang Wajib Anda Coba', excerpt: 'Panduan lengkap rute perjalanan dari Medan ke Danau Toba yang nyaman, aman, dan efisien. Termasuk rekomendasi tempat singgah dan waktu tempuh.', category: 'Wisata', date: '28 Des 2023', readTime: '8 menit' },
  { id: '5', title: 'Toyota Alphard: Pilihan Terbaik untuk Perjalanan Bisnis', excerpt: 'Mengapa Toyota Alphard menjadi pilihan utama para eksekutif dan pebisnis untuk perjalanan nyaman, mewah, dan prestisius di Medan.', category: 'Armada', date: '20 Des 2023', readTime: '5 menit' },
  { id: '6', title: 'Checklist Sebelum Menyewa Mobil untuk Perjalanan Jauh', excerpt: 'Pastikan perjalanan jauh Anda berjalan lancar dengan mengikuti checklist penting sebelum menyewa mobil. Tips dari tim Dearma Sewa Mobil.', category: 'Tips', date: '15 Des 2023', readTime: '4 menit' },
]

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('Semua')

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setArticles(data.length ? data : STATIC_ARTICLES)
      } catch {
        setArticles(STATIC_ARTICLES)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  const categories = ['Semua', ...new Set(articles.map(a => a.category))]
  const filtered = filterCat === 'Semua' ? articles : articles.filter(a => a.category === filterCat)

  return (
    <>
      <Helmet>
        <title>Artikel | Dearma Sewa Mobil Medan</title>
        <meta name="description" content="Baca artikel tips rental mobil, destinasi wisata Sumatera Utara, dan info perjalanan dari Dearma Sewa Mobil Medan." />
      </Helmet>

      <section className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <p className={styles.tag}>Blog & Informasi</p>
          <h1 className={styles.title}>ARTIKEL &<br />TIPS PERJALANAN</h1>
          <div className="gold-line" />
          <p className={styles.subtitle}>Tips, destinasi wisata, dan informasi berguna seputar rental mobil di Medan</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`${styles.filterBtn} ${filterCat === cat ? styles.active : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((a, i) => (
                <Link
                  to={`/artikel/${a.id}`}
                  key={a.id}
                  className={styles.card}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.catBadge}>{a.category}</span>
                    {a.readTime && <span className={styles.readTime}>{a.readTime}</span>}
                  </div>
                  <h2 className={styles.artTitle}>{a.title}</h2>
                  <p className={styles.excerpt}>{a.excerpt}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.date}>{a.date}</span>
                    <span className={styles.readMore}>Baca Selengkapnya →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
