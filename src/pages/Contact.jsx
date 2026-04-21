import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) {
      toast.error('Lengkapi semua field!')
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        createdAt: serverTimestamp(),
        status: 'new'
      })
      toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.')
      setForm({ name: '', phone: '', message: '' })
    } catch {
      toast.error('Gagal mengirim pesan. Coba via WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Dearma, nama saya ${form.name || '...'}, saya ingin menanyakan tentang rental mobil.`)}`

  return (
    <>
      <Helmet>
        <title>Kontak | Dearma Sewa Mobil Medan</title>
        <meta name="description" content="Hubungi Dearma Sewa Mobil Medan untuk reservasi dan informasi rental mobil. Tersedia via WhatsApp, telepon, dan form online 24 jam." />
      </Helmet>

      <section className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <p className={styles.tag}>Hubungi Kami</p>
          <h1 className={styles.title}>KONTAK &<br />RESERVASI</h1>
          <div className="gold-line" />
          <p className={styles.subtitle}>Siap melayani Anda 24 jam sehari, 7 hari seminggu</p>
        </div>
      </section>

      <section className={styles.main}>
        <div className="container">
          <div className={styles.grid}>

            {/* Contact Info */}
            <div className={styles.info}>
              <h2 className={styles.infoTitle}>Cara Menghubungi Kami</h2>
              <p className={styles.infoDesc}>Pilih cara yang paling nyaman untuk Anda. Kami akan segera merespons pertanyaan Anda.</p>

              <div className={styles.contacts}>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={`${styles.contactItem} ${styles.wa}`}>
                  <div className={styles.contactIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>WhatsApp (Cepat)</strong>
                    <p>0812-3456-7890</p>
                  </div>
                  <span className={styles.arrow}>→</span>
                </a>

                <a href="tel:+6281234567890" className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.96-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Telepon</strong>
                    <p>0812-3456-7890</p>
                  </div>
                  <span className={styles.arrow}>→</span>
                </a>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Alamat</strong>
                    <p>Jl. Setia Budi No. 123, Medan Selayang,<br />Kota Medan, Sumatera Utara 20131</p>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Jam Operasional</strong>
                    <p>Senin – Minggu: 24 Jam</p>
                  </div>
                </div>
              </div>

              <div className={styles.socials}>
                <a href="https://www.instagram.com/dearmasewamobil" target="_blank" rel="noopener noreferrer" className={styles.social}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeLinecap="round" strokeWidth="3"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/dearmasewamobil" target="_blank" rel="noopener noreferrer" className={styles.social}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

            {/* Form */}
            <div className={styles.formWrap}>
              <h2 className={styles.formTitle}>Kirim Pesan</h2>
              <form onSubmit={submit} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Nama Lengkap *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handle}
                    placeholder="Nama Anda"
                    className={styles.input}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>No. WhatsApp / Telepon *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handle}
                    placeholder="0812xxxxxxxx"
                    className={styles.input}
                    required
                    autoComplete="tel"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Pesan / Pertanyaan *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handle}
                    placeholder="Tuliskan pertanyaan atau kebutuhan rental mobil Anda..."
                    className={styles.textarea}
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <>
                      <div className={styles.btnSpinner} />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
              <div className={styles.orDivider}><span>atau langsung hubungi via</span></div>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Chat WhatsApp Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
