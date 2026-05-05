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

          {/* Share Buttons */}
          <div className={styles.shareSection}>
            <div className={styles.shareTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Bagikan Artikel Ini
            </div>
            <div className={styles.shareButtons}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareFacebook}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Bagikan di Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent((article?.title || '') + ' - Baca selengkapnya: ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareWhatsapp}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Bagikan di WhatsApp
              </a>
            </div>
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
