import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
  orderBy, query, serverTimestamp, getDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../firebase/config'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import styles from './AdminDashboard.module.css'

const TABS = ['Dashboard', 'Artikel', 'Testimoni', 'Paket Tour', 'Armada', 'SEO', 'Pesan Masuk']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Dashboard')
  const [articles, setArticles] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [tours, setTours] = useState([])
  const [cars, setCars] = useState([])
  const [seo, setSeo] = useState({})
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [artSnap, testiSnap, tourSnap, carSnap, seoSnap, contactSnap] = await Promise.all([
        getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'tours'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'cars'), orderBy('createdAt', 'desc'))),
        getDoc(doc(db, 'settings', 'seo')),
        getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')))
      ])
      setArticles(artSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTestimonials(testiSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTours(tourSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCars(carSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSeo(seoSnap.exists() ? seoSnap.data() : {})
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
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', included: '', excluded: '', imageUrl: '', tag: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const uploadImage = async (file) => {
    if (!file) return null
    setUploading(true)
    try {
      const storageRef = ref(storage, `tours/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (e) {
      toast.error('Gagal upload gambar')
      return null
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi!'); return }
    try {
      const data = { ...form, price: Number(form.price), updatedAt: serverTimestamp() }
      if (editing) {
        await updateDoc(doc(db, 'tours', editing), data)
        toast.success('Paket tour diperbarui!')
      } else {
        await addDoc(collection(db, 'tours'), { ...data, createdAt: serverTimestamp() })
        toast.success('Paket tour ditambahkan!')
      }
      setForm({ name: '', description: '', price: '', duration: '', included: '', excluded: '', imageUrl: '', tag: '' })
      setEditing(null); setShowForm(false)
      refresh()
    } catch { toast.error('Gagal menyimpan') }
  }

  const remove = async id => {
    if (!confirm('Hapus paket ini?')) return
    await deleteDoc(doc(db, 'tours', id))
    toast.success('Dihapus!'); refresh()
  }

  const edit = t => {
    setForm({ name: t.name, description: t.description || '', price: t.price?.toString() || '', duration: t.duration || '', included: t.included || '', excluded: t.excluded || '', imageUrl: t.imageUrl || '', tag: t.tag || '' })
    setEditing(t.id); setShowForm(true)
  }

  const onImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await uploadImage(file)
      if (url) setForm(p => ({ ...p, imageUrl: url }))
    }
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => { setForm({ name: '', description: '', price: '', duration: '', included: '', excluded: '', imageUrl: '', tag: '' }); setEditing(null); setShowForm(true) }}>
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
              <div className={styles.field}><label>Tag</label><input name="tag" value={form.tag} onChange={handle} className={styles.inp} placeholder="Terlaris, Promo, dll" /></div>
            </div>
            <div className={styles.field}><label>Deskripsi</label><textarea name="description" value={form.description} onChange={handle} className={styles.inp} rows={3} placeholder="Deskripsi paket tour..." /></div>
            <div className={styles.field}><label>Imagemax (16:9)</label><input type="file" accept="image/*" onChange={onImageChange} className={styles.inp} disabled={uploading} />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: 120, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />}
            </div>
            <div className={styles.field}><label>Termasuk</label><textarea name="included" value={form.included} onChange={handle} className={styles.inp} rows={2} placeholder="Tiket masuk, Hotel, Sopir, dll" /></div>
            <div className={styles.field}><label>Tidak Termasuk</label><textarea name="excluded" value={form.excluded} onChange={handle} className={styles.inp} rows={2} placeholder="Makan, Tiket masuk объек wisata" /></div>
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
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const uploadImage = async (file) => {
    if (!file) return null
    setUploading(true)
    try {
      const storageRef = ref(storage, `cars/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (e) {
      toast.error('Gagal upload gambar')
      return null
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name || !form.pricePerDay) { toast.error('Nama dan harga wajib diisi!'); return }
    try {
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
    } catch { toast.error('Gagal menyimpan') }
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

  const onImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await uploadImage(file)
      if (url) setForm(p => ({ ...p, imageUrl: url }))
    }
  }

  const categories = ['MPV', 'MPV Premium', 'SUV', 'Luxury MPV', 'Luxury Hybrid', 'Minibus', 'Luxury Minibus']

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => { setForm({ name: '', category: '', seats: '', pricePerDay: '', priceWithDriver: '', description: '', features: '', imageUrl: '', tag: '' }); setEditing(null); setShowForm(true) }}>
          + Tambah Armada
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

  const uploadImage = async (file) => {
    if (!file) return null
    setUploading(true)
    try {
      const storageRef = ref(storage, `seo/og-${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (e) {
      toast.error('Gagal upload gambar')
      return null
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'seo'), { ...form, updatedAt: serverTimestamp() })
      toast.success('Pengaturan SEO disimpan!')
      refresh()
    } catch { toast.error('Gagal menyimpan') }
  }

  const onImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await uploadImage(file)
      if (url) setForm(p => ({ ...p, ogImage: url }))
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
