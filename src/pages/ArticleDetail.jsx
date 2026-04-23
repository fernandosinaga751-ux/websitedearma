import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSettings } from '../context/SettingsContext'
import styles from './ArticleDetail.module.css'

const STATIC = {
  '1': {
    title: 'Tips Memilih Rental Mobil Terpercaya di Medan',
    category: 'Tips',
    date: '15 Januari 2024',
    readTime: '4 menit',
    content: `
      <h2>Pentingnya Memilih Rental Mobil yang Tepat</h2>
      <p>Memilih jasa rental mobil yang tepat di Medan bisa menjadi perbedaan antara perjalanan yang menyenangkan dan pengalaman yang penuh masalah. Dengan banyaknya pilihan yang tersedia, berikut adalah panduan lengkap untuk membantu Anda membuat keputusan terbaik.</p>
      
      <h2>1. Periksa Legalitas dan Izin Usaha</h2>
      <p>Pastikan rental mobil yang Anda pilih memiliki izin usaha yang sah dan terdaftar secara resmi. Rental yang terpercaya biasanya memiliki dokumen lengkap seperti STNK kendaraan yang aktif, asuransi kendaraan, dan izin operasional bisnis.</p>
      
      <h2>2. Kondisi dan Perawatan Armada</h2>
      <p>Tanyakan jadwal perawatan rutin kendaraan. Mobil yang terawat baik akan memberikan keamanan lebih dalam perjalanan. Dearma Sewa Mobil melakukan pemeriksaan berkala setiap kendaraan sebelum diserahkan ke pelanggan.</p>
      
      <h2>3. Transparansi Harga</h2>
      <p>Rental terpercaya akan memberikan harga yang transparan tanpa biaya tersembunyi. Pastikan Anda mendapatkan rincian biaya yang mencakup: harga sewa per hari, biaya bahan bakar (jika ada), asuransi, dan biaya sopir (jika menggunakan driver).</p>
      
      <h2>4. Testimoni dan Ulasan Pelanggan</h2>
      <p>Baca ulasan dari pelanggan sebelumnya melalui media sosial, Google Reviews, atau platform lainnya. Pengalaman nyata dari pelanggan lain adalah indikator terpercaya kualitas layanan.</p>
      
      <h2>5. Layanan Customer Service</h2>
      <p>Rental mobil yang baik memiliki layanan pelanggan yang responsif dan mudah dihubungi, terutama saat situasi darurat di tengah perjalanan. Pastikan tersedia nomor yang bisa dihubungi 24 jam.</p>
      
      <h2>Kesimpulan</h2>
      <p>Dengan memperhatikan faktor-faktor di atas, Anda dapat menemukan jasa rental mobil yang terpercaya di Medan. Dearma Sewa Mobil Medan hadir dengan armada lengkap, harga transparan, dan sopir profesional untuk memastikan perjalanan Anda selalu menyenangkan.</p>
    `
  }
}

export default function ArticleDetail() {
  const { settings } = useSettings()
  const waNumber = settings.whatsapp || '6281234567890'
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const snap = await getDoc(doc(db, 'articles', id))
        if (snap.exists()) {
          setArticle({ id: snap.id, ...snap.data() })
        } else {
          setArticle(STATIC[id] || null)
        }
      } catch {
        setArticle(STATIC[id] || null)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [id])

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  )

  if (!article) return (
    <div className={styles.notFound}>
      <h2>Artikel tidak ditemukan</h2>
      <Link to="/artikel" className="btn btn-gold">← Kembali ke Artikel</Link>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{article.title} | Dearma Sewa Mobil Medan</title>
        <meta name="description" content={article.excerpt || article.title} />
      </Helmet>

      <section className={styles.header}>
        <div className="container">
          <Link to="/artikel" className={styles.back}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Kembali ke Artikel
          </Link>
          <div className={styles.meta}>
            <span className={styles.catBadge}>{article.category}</span>
            <span className={styles.readTime}>{article.readTime || '5 menit'} baca</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.dateLine}>{article.date}</div>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.articleContent}>
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p>{article.excerpt}</p>
            )}
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <h3>Butuh Mobil untuk Perjalanan Anda?</h3>
            <p>Hubungi Dearma Sewa Mobil Medan sekarang dan dapatkan penawaran terbaik!</p>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Dearma, saya ingin memesan mobil rental")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Pesan Sekarang via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
