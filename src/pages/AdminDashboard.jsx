import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  orderBy, query, serverTimestamp, getDoc, setDoc
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { uploadToCloudinary } from '../utils/cloudinary'
import { seedCarsToFirebase } from '../utils/seedData'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'
import styles from './AdminDashboard.module.css'

const TABS = ['Dashboard', 'Artikel', 'Testimoni', 'Paket Tour', 'Armada', 'SEO', 'Pengaturan', 'Pesan Masuk']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Dashboard')
  const [articles, setArticles] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [tours, setTours] = useState([])
  const [cars, setCars] = useState([])
  const [seo, setSeo] = useState({})
  const [settings, setSettings] = useState({})
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [artSnap, testiSnap, tourSnap, carSnap, seoSnap, settingsSnap, contactSnap] = await Promise.all([
        getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'tours'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'cars'), orderBy('createdAt', 'desc'))),
        getDoc(doc(db, 'settings', 'seo')),
        getDoc(doc(db, 'settings', 'general')),
        getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')))
      ])
      setArticles(artSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTestimonials(testiSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTours(tourSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCars(carSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSeo(seoSnap.exists() ? seoSnap.data() : {})
      setSettings(settingsSnap.exists() ? settingsSnap.data() : {})
      setContacts(contactSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
    navigate('/admin/login')
    toast.success('Berhasil logout')
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <img src={logo} alt="Dearma" className={styles.sidebarLogo} />
          <div>
            <div className={styles.brandName}>DEARMA</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`${styles.navItem} ${tab === t ? styles.navActive : ''}`}
            >
              {t === 'Dashboard' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
              {t === 'Artikel' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              {t === 'Testimoni' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              {t === 'Paket Tour' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.93" y1="4.93" x2="9.88" y2="9.88"/></svg>}
              {t === 'Armada' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="22" height="14" rx="2" ry="2"/><path d="M16 10H4"/><circle cx="5.5" cy="17" r="2"/><circle cx="18.5" cy="17" r="2"/></svg>}
              {t === 'SEO' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>}
              {t === 'Pengaturan' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              {t === 'Pesan Masuk' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2 6"/></svg>}
              {t}
              {t === 'Pesan Masuk' && contacts.filter(c => c.status === 'new').length > 0 && (
                <span className={styles.badge}>{contacts.filter(c => c.status === 'new').length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Lihat Website
          </a>
          <button onClick={logout} className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1 className={styles.pageTitle}>{tab}</h1>
          <span className={styles.pageDate}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {loading && <div className={styles.loadingBar}><div className={styles.loadingBarInner} /></div>}

        {tab === 'Dashboard' && <DashboardTab articles={articles} testimonials={testimonials} tours={tours} cars={cars} contacts={contacts} />}
        {tab === 'Artikel' && <ArticlesTab articles={articles} refresh={fetchAll} />}
        {tab === 'Testimoni' && <TestimonialsTab testimonials={testimonials} refresh={fetchAll} />}
        {tab === 'Paket Tour' && <ToursTab tours={tours} refresh={fetchAll} />}
        {tab === 'Armada' && <CarsTab cars={cars} refresh={fetchAll} />}
        {tab === 'SEO' && <SeoTab seo={seo} refresh={fetchAll} />}
        {tab === 'Pengaturan' && <SettingsTab settings={settings} refresh={fetchAll} />}
        {tab === 'Pesan Masuk' && <ContactsTab contacts={contacts} refresh={fetchAll} />}
      </main>
    </div>
  )
}

// --- Dashboard Tab ---
function DashboardTab({ articles, testimonials, tours, cars, contacts }) {
  const newMessages = contacts.filter(c => c.status === 'new').length
  const stats = [
    { label: 'Total Artikel', value: articles.length, icon: '📝', color: '#c9a227' },
    { label: 'Testimoni', value: testimonials.length, icon: '⭐', color: '#4CAF50' },
    { label: 'Paket Tour', value: tours.length, icon: '🚗', color: '#9C27B0' },
    { label: 'Armada', value: cars.length, icon: '🚙', color: '#00BCD4' },
    { label: 'Pesan Masuk', value: contacts.length, icon: '📨', color: '#2196F3' },
    { label: 'Pesan Baru', value: newMessages, icon: '🔔', color: '#FF5722' },
  ]
  return (
    <div>
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.recentSection}>
        <h3 className={styles.recentTitle}>Pesan Terbaru</h3>
        <div className={styles.recentList}>
          {contacts.slice(0, 5).map(c => (
            <div key={c.id} className={styles.recentItem}>
              <div className={styles.recentAvatar}>{c.name?.[0] || '?'}</div>
              <div>
                <div className={styles.recentName}>{c.name}</div>
                <div className={styles.recentMsg}>{c.message?.slice(0, 60)}...</div>
              </div>
              {c.status === 'new' && <span className={styles.newBadge}>Baru</span>}
            </div>
          ))}
          {contacts.length === 0 && <p style={{ color: '#8892a4', fontSize: '0.9rem' }}>Belum ada pesan masuk.</p>}
        </div>
      </div>
    </div>
  )
}

// --- Articles Tab ---
function ArticlesTab({ articles, refresh }) {
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'Tips', date: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.title || !form.excerpt) { toast.error('Judul dan ringkasan wajib diisi!'); return }
    try {
      const data = {
        ...form,
        date: form.date || new Date().toLocaleDateString('id-ID'),
        readTime: `${Math.max(1, Math.ceil((form.content?.split(' ').length || 100) / 200))} menit`,
        updatedAt: serverTimestamp()
      }
      if (editing) {
        await updateDoc(doc(db, 'articles', editing), data)
        toast.success('Artikel diperbarui!')
      } else {
        await addDoc(collection(db, 'articles'), { ...data, createdAt: serverTimestamp() })
        toast.success('Artikel ditambahkan!')
      }
      setForm({ title: '', excerpt: '', content: '', category: 'Tips', date: '' })
      setEditing(null); setShowForm(false)
      refresh()
    } catch { toast.error('Gagal menyimpan artikel') }
  }

  const remove = async id => {
    if (!confirm('Hapus artikel ini?')) return
    await deleteDoc(doc(db, 'articles', id))
    toast.success('Artikel dihapus')
    refresh()
  }

  const edit = a => {
    setForm({ title: a.title, excerpt: a.excerpt, content: a.content || '', category: a.category || 'Tips', date: a.date || '' })
    setEditing(a.id); setShowForm(true)
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => { setForm({ title: '', excerpt: '', content: '', category: 'Tips', date: '' }); setEditing(null); setShowForm(true) }}>
          + Tambah Artikel
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>{editing ? 'Edit Artikel' : 'Artikel Baru'}</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Judul *</label>
              <input name="title" value={form.title} onChange={handle} placeholder="Judul artikel..." className={styles.inp} />
            </div>
            <div className={styles.field}>
              <label>Kategori</label>
              <select name="category" value={form.category} onChange={handle} className={styles.inp}>
                {['Tips', 'Wisata', 'Info', 'Armada', 'Promo'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Ringkasan *</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handle} placeholder="Ringkasan singkat artikel..." className={styles.inp} rows={3} />
          </div>
          <div className={styles.field}>
            <label>Konten (HTML diizinkan)</label>
            <textarea name="content" value={form.content} onChange={handle} placeholder="<h2>Judul Section</h2><p>Isi konten...</p>" className={styles.inp} rows={10} />
          </div>
          <div className={styles.formActions}>
            <button onClick={save} className={styles.saveBtn}>{editing ? 'Update' : 'Simpan'}</button>
            <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>Batal</button>
          </div>
        </div>
      )}

      <div className={styles.dataTable}>
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td><span className={styles.catPill}>{a.category}</span></td>
                <td>{a.date}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button onClick={() => edit(a)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => remove(a.id)} className={styles.delBtn}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && <p className={styles.empty}>Belum ada artikel. Tambahkan artikel pertama Anda!</p>}
      </div>
    </div>
  )
}

// --- Testimonials Tab ---
function TestimonialsTab({ testimonials, refresh }) {
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5, avatar: '' })
  const [showForm, setShowForm] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const save = async () => {
    if (!form.name || !form.text) { toast.error('Nama dan testimoni wajib diisi!'); return }
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...form,
        avatar: form.name[0]?.toUpperCase(),
        createdAt: serverTimestamp()
      })
      toast.success('Testimoni ditambahkan!')
      setForm({ name: '', role: '', text: '', rating: 5, avatar: '' })
      setShowForm(false); refresh()
    } catch { toast.error('Gagal menyimpan') }
  }

  const remove = async id => {
    if (!confirm('Hapus testimoni ini?')) return
    await deleteDoc(doc(db, 'testimonials', id))
    toast.success('Dihapus!'); refresh()
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>+ Tambah Testimoni</button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Testimoni Baru</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}><label>Nama *</label><input name="name" value={form.name} onChange={handle} className={styles.inp} placeholder="Nama pelanggan" /></div>
            <div className={styles.field}><label>Jabatan / Role</label><input name="role" value={form.role} onChange={handle} className={styles.inp} placeholder="Pengusaha, Wisatawan, dll" /></div>
          </div>
          <div className={styles.field}><label>Rating (1-5)</label><input name="rating" type="number" min={1} max={5} value={form.rating} onChange={handle} className={styles.inp} /></div>
          <div className={styles.field}><label>Testimoni *</label><textarea name="text" value={form.text} onChange={handle} className={styles.inp} rows={4} placeholder="Isi testimoni pelanggan..." /></div>
          <div className={styles.formActions}>
            <button onClick={save} className={styles.saveBtn}>Simpan</button>
            <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>Batal</button>
          </div>
        </div>
      )}

      <div className={styles.testiGrid}>
        {testimonials.map(t => (
          <div key={t.id} className={styles.testiCard}>
            <div className={styles.testiHeader}>
              <div className={styles.testiAvatar}>{t.avatar || t.name?.[0]}</div>
              <div>
                <div className={styles.testiName}>{t.name}</div>
                <div className={styles.testiRole}>{t.role}</div>
              </div>
              <div className={styles.stars}>{'⭐'.repeat(t.rating || 5)}</div>
            </div>
            <p className={styles.testiText}>"{t.text}"</p>
            <button onClick={() => remove(t.id)} className={styles.delBtn} style={{ marginTop: 12 }}>Hapus</button>
          </div>
        ))}
        {testimonials.length === 0 && <p className={styles.empty}>Belum ada testimoni.</p>}
      </div>
    </div>
  )
}

// --- Contacts Tab ---
function ContactsTab({ contacts, refresh }) {
  const markRead = async id => {
    await updateDoc(doc(db, 'contacts', id), { status: 'read' })
    refresh()
  }

  const remove = async id => {
    if (!confirm('Hapus pesan ini?')) return
    await deleteDoc(doc(db, 'contacts', id))
    toast.success('Pesan dihapus!'); refresh()
  }

  return (
    <div>
      <div className={styles.contactsList}>
        {contacts.map(c => (
          <div key={c.id} className={`${styles.contactCard} ${c.status === 'new' ? styles.contactNew : ''}`}>
            <div className={styles.contactTop}>
              <div className={styles.contactAvatar}>{c.name?.[0]}</div>
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{c.name}</div>
                <div className={styles.contactPhone}>{c.phone}</div>
              </div>
              {c.status === 'new' && <span className={styles.newBadge}>Baru</span>}
            </div>
            <p className={styles.contactMsg}>{c.message}</p>
            <div className={styles.contactActions}>
              <a href={`https://wa.me/${c.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className={styles.waReply}>
                Balas WA
              </a>
              {c.status === 'new' && (
                <button onClick={() => markRead(c.id)} className={styles.markReadBtn}>Tandai Dibaca</button>
              )}
              <button onClick={() => remove(c.id)} className={styles.delBtn}>Hapus</button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p className={styles.empty}>Belum ada pesan masuk.</p>}
      </div>
    </div>
  )
}

// --- Tours Tab ---
function ToursTab({ tours, refresh }) {
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    duration: '', 
    included: '', 
    excluded: '', 
    imageUrl: '', 
    tag: '', 
    itinerary: '', 
    minParticipants: '1', 
    notes: '', 
    location: '', 
    faq: '',
    paxPricing: [] // { pax: number, totalPrice: number, carType: string }[]
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

   const onImageChange = async (e) => {
     const file = e.target.files[0]
     if (!file) return
     
     setUploading(true)
     try {
       const url = await uploadToCloudinary(file, 'dearma/tours')
       if (url) {
         setForm(p => ({ ...p, imageUrl: url }))
         toast.success('Gambar berhasil diupload!')
       }
     } catch (err) {
       toast.error('Gagal upload gambar: ' + err.message)
     } finally {
       setUploading(false)
     }
   }

   const addPaxPricing = () => {
     setForm(p => ({
       ...p,
       paxPricing: [...(p.paxPricing || []), { pax: 1, price: '', carType: 'Avanza' }]
     }))
   }

   const removePaxPricing = (index) => {
     setForm(p => ({
       ...p,
       paxPricing: p.paxPricing.filter((_, i) => i !== index)
     }))
   }

   const updatePaxPricing = (index, field, value) => {
     setForm(p => ({
       ...p,
       paxPricing: p.paxPricing.map((item, i) => 
         i === index ? { 
           ...item, 
           [field]: field === 'pax' || field === 'price' ? Number(value) : value 
         } : item
       )
     }))
   }

    const save = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Nama paket wajib diisi!'); return }
    try {
      console.log('Saving tour data:', form)
      const data = { 
        ...form, 
        price: Number(form.price) || 0,
        minParticipants: Number(form.minParticipants) || 1,
        paxPricing: form.paxPricing.map(p => ({
          ...p,
          pax: Number(p.pax),
          totalPrice: Number(p.price) // price di form adalah total price
        })),
        updatedAt: serverTimestamp() 
      }
      if (editing) {
        await updateDoc(doc(db, 'tours', editing), data)
        toast.success('Paket tour diperbarui!')
      } else {
        await addDoc(collection(db, 'tours'), { ...data, createdAt: serverTimestamp() })
        toast.success('Paket tour ditambahkan!')
      }
       setForm({ name: '', description: '', price: '', duration: '', included: '', excluded: '', imageUrl: '', tag: '', itinerary: '', minParticipants: '1', notes: '', location: '', faq: '' })
      setEditing(null); setShowForm(false)
      refresh()
    } catch (err) { 
      console.error('Error saving tour:', err)
      toast.error('Gagal menyimpan: ' + err.message) 
    }
  }

  const remove = async id => {
    if (!confirm('Hapus paket ini?')) return
    await deleteDoc(doc(db, 'tours', id))
    toast.success('Dihapus!'); refresh()
  }

   const edit = t => {
     setForm({ 
       name: t.name || '', 
       description: t.description || '', 
       price: t.price?.toString() || '', 
       duration: t.duration || '', 
       included: t.included || '', 
       excluded: t.excluded || '', 
       imageUrl: t.imageUrl || '', 
       tag: t.tag || '',
       itinerary: t.itinerary || '',
       minParticipants: t.minParticipants?.toString() || '1',
       notes: t.notes || '',
       location: t.location || '',
       faq: t.faq || '',
        paxPricing: t.paxPricing ? t.paxPricing.map(p => ({
          pax: p.pax,
          price: p.totalPrice || p.price, // support both field names
          carType: p.carType
        })) : []
     })
     setEditing(t.id); setShowForm(true)
   }

  return (
    <div>
       <div className={styles.tabHeader}>
         <button className={styles.addBtn} onClick={() => { setForm({ name: '', description: '', price: '', duration: '', included: '', excluded: '', imageUrl: '', tag: '', itinerary: '', minParticipants: '1', notes: '', location: '', faq: '', paxPricing: [] }); setEditing(null); setShowForm(true) }}>
           + Tambah Paket Tour
         </button>
       </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>{editing ? 'Edit Paket Tour' : 'Paket Tour Baru'}</h3>
          <form onSubmit={save}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Nama Paket *</label><input name="name" value={form.name} onChange={handle} className={styles.inp} placeholder="Paket Tour Lake Toba, dll" /></div>
              <div className={styles.field}><label>Harga (Rp) *</label><input name="price" type="number" value={form.price} onChange={handle} className={styles.inp} placeholder="500000" /></div>
              <div className={styles.field}><label>Durasi</label><input name="duration" value={form.duration} onChange={handle} className={styles.inp} placeholder="2 Hari 1 Malam" /></div>
              <div className={styles.field}><label>Min. Peserta</label><input name="minParticipants" type="number" value={form.minParticipants} onChange={handle} className={styles.inp} placeholder="1" /></div>
            </div>
            <div className={styles.field}><label>Tag</label><input name="tag" value={form.tag} onChange={handle} className={styles.inp} placeholder="Terlaris, Promo, dll" /></div>
            <div className={styles.field}><label>Deskripsi</label><textarea name="description" value={form.description} onChange={handle} className={styles.inp} rows={3} placeholder="Deskripsi paket tour..." /></div>
            <div className={styles.field}><label>Itinerary (satu baris per hari)</label><textarea name="itinerary" value={form.itinerary} onChange={handle} className={styles.inp} rows={4} placeholder="Hari 1: Check-in hotel&#10;Hari 2: Tour danau&#10;Hari 3: Pulang" /></div>
            <div className={styles.field}><label>Gambar (16:9)</label><input type="file" accept="image/*" onChange={onImageChange} className={styles.inp} disabled={uploading} />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: 120, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />}
            </div>
            <div className={styles.field}><label>Termasuk (satu per baris)</label><textarea name="included" value={form.included} onChange={handle} className={styles.inp} rows={3} placeholder="Tiket masuk&#10;Hotel&#10;Sopir & mobil" /></div>
            <div className={styles.field}><label>Tidak Termasuk (satu per baris)</label><textarea name="excluded" value={form.excluded} onChange={handle} className={styles.inp} rows={2} placeholder="Makanan&#10;Tiket masuk objek wisata tambahan" /></div>

            <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Harga Berdasarkan Jumlah Orang & Jenis Mobil</h4>
            <div className={styles.field} style={{ marginBottom: '12px' }}>
              <label>Harga Dasar (Rp) - untuk 1 org</label>
              <input name="price" type="number" value={form.price} onChange={handle} className={styles.inp} placeholder="500000" />
              <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>* Harga per orang untuk 1 participant</small>
            </div>
            <div className={styles.paxPricingGrid}>
              {form.paxPricing && form.paxPricing.map((item, idx) => (
                <div key={idx} className={styles.paxPricingItem}>
                  <div className={styles.paxPricingHeader}>
                    <span>Harga untuk {item.pax} org</span>
                    <button type="button" onClick={() => removePaxPricing(idx)} className={styles.removePaxBtn}>×</button>
                  </div>
                  <div className={styles.paxPricingFields}>
                    <div className={styles.field}>
                      <label>Jumlah Org</label>
                      <input 
                        type="number" 
                        value={item.pax} 
                        onChange={(e) => updatePaxPricing(idx, 'pax', e.target.value)}
                        className={styles.inp}
                        min="1"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Harga (Rp)</label>
                      <input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => updatePaxPricing(idx, 'price', e.target.value)}
                        className={styles.inp}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Jenis Mobil</label>
                      <select 
                        value={item.carType} 
                        onChange={(e) => updatePaxPricing(idx, 'carType', e.target.value)}
                        className={styles.inp}
                      >
                        <option value="Avanza">Avanza</option>
                        <option value="Innova">Innova</option>
                        <option value="Hiace">Hiace</option>
                        <option value="Alphard">Alphard</option>
                        <option value="Fortuner">Fortuner</option>
                        <option value="Pajero">Pajero</option>
                        <option value="Hiace Premio">Hiace Premio</option>
                        <option value="Alphard HEV">Alphard HEV</option>
                        <option value="Innova Zenix">Innova Zenix</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addPaxPricing} className={styles.addPaxBtn}>+ Tambah Harga untuk Jumlah Lain</button>
            </div>

            <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Informasi Tambahan</h4>
            <div className={styles.field}><label>Catatan</label><textarea name="notes" value={form.notes} onChange={handle} className={styles.inp} rows={3} placeholder="Informasi tambahan untuk pelanggan..." /></div>
            <div className={styles.field}><label>Lokasi</label><textarea name="location" value={form.location} onChange={handle} className={styles.inp} rows={2} placeholder="Alamat lokasi tour..." /></div>
            <div className={styles.field}><label>FAQ (satu pertanyaan per baris)</label><textarea name="faq" value={form.faq} onChange={handle} className={styles.inp} rows={4} placeholder="Apakah include makan?&#10;Bagaimana jadwalnya?" /></div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={uploading}>{editing ? 'Update' : 'Simpan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.dataTable}>
        <table>
          <thead><tr><th>Nama Paket</th><th>Harga</th><th>Durasi</th><th>Aksi</th></tr></thead>
          <tbody>
            {tours.map(t => (
              <tr key={t.id}>
                <td>{t.imageUrl && <img src={t.imageUrl} alt="" style={{ width: 60, height: 40, objectFit: 'cover', marginRight: 8, borderRadius: 4, verticalAlign: 'middle' }} />}{t.name}</td>
                <td>Rp {Number(t.price || 0).toLocaleString('id-ID')}</td>
                <td>{t.duration || '-'}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button onClick={() => edit(t)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => remove(t.id)} className={styles.delBtn}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tours.length === 0 && <p className={styles.empty}>Belum ada paket tour. Tambahkan paket pertama!</p>}
      </div>
    </div>
  )
}

// --- Cars Tab ---
function CarsTab({ cars, refresh }) {
  const [form, setForm] = useState({ name: '', category: '', seats: '', pricePerDay: '', priceWithDriver: '', description: '', features: '', imageUrl: '', tag: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSeedCars = async () => {
    if (!confirm('Hapus semua armada dan reset ke data default?')) return
    setSeeding(true)
    try {
      const result = await seedCarsToFirebase()
      if (result.success) {
        toast.success(`Berhasil reset ${result.count} armada!`)
        refresh()
      } else {
        toast.error('Gagal: ' + result.error)
      }
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  const onImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'dearma/cars')
      if (url) {
        setForm(p => ({ ...p, imageUrl: url }))
        toast.success('Gambar berhasil diupload!')
      }
    } catch (err) {
      toast.error('Gagal upload gambar: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name || !form.pricePerDay) { toast.error('Nama dan harga wajib diisi!'); return }
    try {
      console.log('Saving car data:', form)
      const data = {
        ...form,
        seats: Number(form.seats) || 7,
        pricePerDay: Number(form.pricePerDay),
        priceWithDriver: Number(form.priceWithDriver) || Number(form.pricePerDay) + 150000,
        features: form.features ? form.features.split(',').map(f => f.trim()) : [],
        updatedAt: serverTimestamp()
      }
      if (editing) {
        await updateDoc(doc(db, 'cars', editing), data)
        toast.success('Armada diperbarui!')
      } else {
        await addDoc(collection(db, 'cars'), { ...data, createdAt: serverTimestamp(), popular: false })
        toast.success('Armada ditambahkan!')
      }
      setForm({ name: '', category: '', seats: '', pricePerDay: '', priceWithDriver: '', description: '', features: '', imageUrl: '', tag: '' })
      setEditing(null); setShowForm(false)
      refresh()
    } catch (err) { 
      console.error('Error saving car:', err)
      toast.error('Gagal menyimpan: ' + err.message) 
    }
  }

  const remove = async id => {
    if (!confirm('Hapus armada ini?')) return
    await deleteDoc(doc(db, 'cars', id))
    toast.success('Dihapus!'); refresh()
  }

  const edit = c => {
    setForm({
      name: c.name, category: c.category || '', seats: c.seats?.toString() || '', pricePerDay: c.pricePerDay?.toString() || '', priceWithDriver: c.priceWithDriver?.toString() || '',
      description: c.description || '', features: c.features?.join(', ') || '', imageUrl: c.imageUrl || '', tag: c.tag || ''
    })
    setEditing(c.id); setShowForm(true)
  }

  const categories = ['MPV', 'MPV Premium', 'SUV', 'Luxury MPV', 'Luxury Hybrid', 'Minibus', 'Luxury Minibus']

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => { setForm({ name: '', category: '', seats: '', pricePerDay: '', priceWithDriver: '', description: '', features: '', imageUrl: '', tag: '' }); setEditing(null); setShowForm(true) }}>
          + Tambah Armada
        </button>
        <button 
          className={styles.addBtn} 
          style={{ background: '#ef4444', marginLeft: 'auto' }}
          onClick={handleSeedCars}
          disabled={seeding}
        >
          {seeding ? 'Resetting...' : '⚡ Reset ke Default'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>{editing ? 'Edit Armada' : 'Armada Baru'}</h3>
          <form onSubmit={save}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Nama Mobil *</label><input name="name" value={form.name} onChange={handle} className={styles.inp} placeholder="Toyota Avanza" /></div>
              <div className={styles.field}><label>Kategori</label><select name="category" value={form.category} onChange={handle} className={styles.inp}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className={styles.field}><label>Kursi</label><input name="seats" type="number" value={form.seats} onChange={handle} className={styles.inp} placeholder="7" /></div>
              <div className={styles.field}><label>Harga Tanpa Sopir (Rp) *</label><input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handle} className={styles.inp} placeholder="350000" /></div>
              <div className={styles.field}><label>Harga Dengan Sopir (Rp)</label><input name="priceWithDriver" type="number" value={form.priceWithDriver} onChange={handle} className={styles.inp} placeholder="500000" /></div>
              <div className={styles.field}><label>Tag</label><input name="tag" value={form.tag} onChange={handle} className={styles.inp} placeholder="Terlaris, Promo" /></div>
            </div>
            <div className={styles.field}><label>Deskripsi</label><textarea name="description" value={form.description} onChange={handle} className={styles.inp} rows={3} placeholder="Deskripsi mobil..." /></div>
            <div className={styles.field}><label>Fitur (pisahkan dengan koma)</label><input name="features" value={form.features} onChange={handle} className={styles.inp} placeholder="AC, Bluetooth, Sunroof" /></div>
            <div className={styles.field}><label>Gambar</label><input type="file" accept="image/*" onChange={onImageChange} className={styles.inp} disabled={uploading} />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: 160, height: 100, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />}
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={uploading}>{editing ? 'Update' : 'Simpan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.dataTable}>
        <table>
          <thead><tr><th>Mobil</th><th>Kategori</th><th>Harga/Hari</th><th>Aksi</th></tr></thead>
          <tbody>
            {cars.map(c => (
              <tr key={c.id}>
                <td>{c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: 80, height: 50, objectFit: 'cover', marginRight: 8, borderRadius: 4, verticalAlign: 'middle' }} />}{c.name}</td>
                <td><span className={styles.catPill}>{c.category}</span></td>
                <td>Rp {Number(c.pricePerDay || 0).toLocaleString('id-ID')}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button onClick={() => edit(c)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => remove(c.id)} className={styles.delBtn}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && <p className={styles.empty}>Belum ada armada. Tambahkan armada pertama!</p>}
      </div>
    </div>
  )
}

// --- SEO Tab ---
function SeoTab({ seo, refresh }) {
  const [form, setForm] = useState({
    homeTitle: seo?.homeTitle || '',
    homeDesc: seo?.homeDesc || '',
    fleetTitle: seo?.fleetTitle || '',
    fleetDesc: seo?.fleetDesc || '',
    tourTitle: seo?.tourTitle || '',
    tourDesc: seo?.tourDesc || '',
    ogImage: seo?.ogImage || '',
    keywords: seo?.keywords || ''
  })
  const [uploading, setUploading] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    try {
      console.log('Saving SEO data:', form)
      await setDoc(doc(db, 'settings', 'seo'), { ...form, updatedAt: serverTimestamp() }, { merge: true })
      toast.success('Pengaturan SEO disimpan!')
      refresh()
    } catch (err) { 
      console.error('Error saving SEO:', err)
      toast.error('Gagal menyimpan: ' + err.message) 
    }
  }

  const onImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'dearma/seo')
      if (url) {
        setForm(p => ({ ...p, ogImage: url }))
        toast.success('Gambar berhasil diupload!')
      }
    } catch (err) {
      toast.error('Gagal upload gambar: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Pengaturan SEO Website</h3>
        
        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Halaman Beranda</h4>
        <div className={styles.field}><label>Title (Judul)</label><input name="homeTitle" value={form.homeTitle} onChange={handle} className={styles.inp} placeholder="Dearma Sewa Mobil Medan | Rental Mobil Premium" /></div>
        <div className={styles.field}><label>Meta Description</label><textarea name="homeDesc" value={form.homeDesc} onChange={handle} className={styles.inp} rows={3} placeholder="Deskripsi untuk mesin pencari..." /></div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Halaman Armada</h4>
        <div className={styles.field}><label>Title</label><input name="fleetTitle" value={form.fleetTitle} onChange={handle} className={styles.inp} placeholder="Armada Mobil Rental" /></div>
        <div className={styles.field}><label>Description</label><textarea name="fleetDesc" value={form.fleetDesc} onChange={handle} className={styles.inp} rows={2} /></div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Halaman Paket Tour</h4>
        <div className={styles.field}><label>Title</label><input name="tourTitle" value={form.tourTitle} onChange={handle} className={styles.inp} placeholder="Paket Tour Medan" /></div>
        <div className={styles.field}><label>Description</label><textarea name="tourDesc" value={form.tourDesc} onChange={handle} className={styles.inp} rows={2} /></div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Pengaturan Lainnya</h4>
        <div className={styles.field}><label>Keywords (pisahkan dengan koma)</label><input name="keywords" value={form.keywords} onChange={handle} className={styles.inp} placeholder="rental mobil medan, sewa mobil medan, tour medan" /></div>
        <div className={styles.field}><label>OG Image (Gambar untuk sosial media)</label><input type="file" accept="image/*" onChange={onImageChange} className={styles.inp} disabled={uploading} />
          {form.ogImage && <><br /><img src={form.ogImage} alt="OG Preview" style={{ width: 200, height: 105, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} /></>}
        </div>

        <div className={styles.formActions}>
          <button onClick={save} className={styles.saveBtn}>Simpan SEO</button>
        </div>
      </div>
    </div>
  )
}

// --- Settings Tab ---
function SettingsTab({ settings, refresh }) {
  const [form, setForm] = useState({
    whatsapp: settings?.whatsapp || '',
    phone: settings?.phone || '',
    address: settings?.address || '',
    mapsUrl: settings?.mapsUrl || '',
    instagram: settings?.instagram || '',
    facebook: settings?.facebook || '',
    logoUrl: settings?.logoUrl || '',
    fleetHeader1: settings?.fleetHeader1 || '',
    fleetHeader2: settings?.fleetHeader2 || '',
    fleetHeader3: settings?.fleetHeader3 || '',
    tourHeader1: settings?.tourHeader1 || '',
    tourHeader2: settings?.tourHeader2 || '',
    tourHeader3: settings?.tourHeader3 || '',
    homeHeader1: settings?.homeHeader1 || '',
    homeHeader2: settings?.homeHeader2 || '',
    homeHeader3: settings?.homeHeader3 || '',
    homeHeader4: settings?.homeHeader4 || '',
    homeHeader5: settings?.homeHeader5 || ''
  })
  const [uploading, setUploading] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const uploadImage = async (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'dearma/settings')
      if (url) {
        setForm(p => ({ ...p, [fieldName]: url }))
        toast.success('Gambar berhasil diupload!')
      }
    } catch (err) {
      toast.error('Gagal upload: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    try {
      await setDoc(doc(db, 'settings', 'general'), { ...form, updatedAt: serverTimestamp() }, { merge: true })
      toast.success('Pengaturan disimpan!')
      refresh()
      window.location.reload()
    } catch (err) { 
      toast.error('Gagal menyimpan: ' + err.message) 
    }
  }

  return (
    <div>
      <div className={styles.formCard}>
        <h3 className={styles.formCardTitle}>Pengaturan Website</h3>
        
        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Kontak</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}><label>No. WhatsApp</label><input name="whatsapp" value={form.whatsapp} onChange={handle} className={styles.inp} placeholder="6281234567890" /></div>
          <div className={styles.field}><label>No. Telepon</label><input name="phone" value={form.phone} onChange={handle} className={styles.inp} placeholder="061-123456" /></div>
        </div>
        <div className={styles.field}><label>Alamat</label><textarea name="address" value={form.address} onChange={handle} className={styles.inp} rows={2} placeholder="Jl. Setia Budi No. 123, Medan" /></div>
        <div className={styles.field}><label>Google Maps Embed URL</label><input name="mapsUrl" value={form.mapsUrl} onChange={handle} className={styles.inp} placeholder="https://www.google.com/maps/embed?..." /></div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Social Media</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}><label>Instagram</label><input name="instagram" value={form.instagram} onChange={handle} className={styles.inp} placeholder="@dearmasewamobil" /></div>
          <div className={styles.field}><label>Facebook</label><input name="facebook" value={form.facebook} onChange={handle} className={styles.inp} placeholder="Dearma Sewa Mobil Medan" /></div>
        </div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Logo Website</h4>
        <div className={styles.field}><label>Upload Logo</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'logoUrl')} className={styles.inp} disabled={uploading} />
          {form.logoUrl && <img src={form.logoUrl} alt="Logo Preview" style={{ width: 150, marginTop: 8, borderRadius: 8 }} />}
        </div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Header Utama Website (5 Foto)</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}><label>Foto 1</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'homeHeader1')} className={styles.inp} disabled={uploading} />
            {form.homeHeader1 && <img src={form.homeHeader1} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 2</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'homeHeader2')} className={styles.inp} disabled={uploading} />
            {form.homeHeader2 && <img src={form.homeHeader2} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 3</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'homeHeader3')} className={styles.inp} disabled={uploading} />
            {form.homeHeader3 && <img src={form.homeHeader3} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 4</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'homeHeader4')} className={styles.inp} disabled={uploading} />
            {form.homeHeader4 && <img src={form.homeHeader4} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 5</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'homeHeader5')} className={styles.inp} disabled={uploading} />
            {form.homeHeader5 && <img src={form.homeHeader5} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
        </div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Header Halaman Armada (3 Foto)</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}><label>Foto 1</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'fleetHeader1')} className={styles.inp} disabled={uploading} />
            {form.fleetHeader1 && <img src={form.fleetHeader1} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 2</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'fleetHeader2')} className={styles.inp} disabled={uploading} />
            {form.fleetHeader2 && <img src={form.fleetHeader2} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 3</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'fleetHeader3')} className={styles.inp} disabled={uploading} />
            {form.fleetHeader3 && <img src={form.fleetHeader3} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
        </div>

        <h4 style={{ margin: '20px 0 12px', color: '#c9a227' }}>Header Halaman Paket Tour (3 Foto)</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}><label>Foto 1</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'tourHeader1')} className={styles.inp} disabled={uploading} />
            {form.tourHeader1 && <img src={form.tourHeader1} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 2</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'tourHeader2')} className={styles.inp} disabled={uploading} />
            {form.tourHeader2 && <img src={form.tourHeader2} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
          <div className={styles.field}><label>Foto 3</label><input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'tourHeader3')} className={styles.inp} disabled={uploading} />
            {form.tourHeader3 && <img src={form.tourHeader3} alt="" style={{ width: 100, height: 60, objectFit: 'cover', marginTop: 4, borderRadius: 4 }} />}</div>
        </div>

        <div className={styles.formActions}>
          <button onClick={save} className={styles.saveBtn}>Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  )
}
