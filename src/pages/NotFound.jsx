import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - Halaman Tidak Ditemukan | Dearma Sewa Mobil Medan</title></Helmet>
      <div className={styles.page}>
        <div className={styles.bg} />
        <div className={styles.content}>
          <div className={styles.code}>404</div>
          <h1 className={styles.title}>Halaman Tidak Ditemukan</h1>
          <p className={styles.desc}>Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
          <div className={styles.actions}>
            <Link to="/" className="btn btn-gold">Kembali ke Beranda</Link>
            <Link to="/armada" className="btn btn-outline">Lihat Armada</Link>
          </div>
        </div>
      </div>
    </>
  )
}
