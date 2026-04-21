import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) navigate('/admin')
    })
    return unsub
  }, [navigate])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Email dan password wajib diisi!'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      toast.success('Login berhasil!')
      navigate('/admin')
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Email atau password salah!'
        : err.code === 'auth/too-many-requests'
        ? 'Terlalu banyak percobaan. Coba lagi nanti.'
        : 'Login gagal. Periksa koneksi Anda.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img src={logo} alt="Dearma" className={styles.logo} />
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Dearma Sewa Mobil Medan</p>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email Admin</label>
            <div className={styles.inputWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="admin@dearma.com"
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={show ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                className={styles.input}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShow(!show)} className={styles.eyeBtn}>
                {show
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><div className={styles.spinner} /> Masuk...</> : 'Masuk ke Dashboard'}
          </button>
        </form>

        <p className={styles.back}><a href="/">← Kembali ke Website</a></p>
      </div>
    </div>
  )
}
