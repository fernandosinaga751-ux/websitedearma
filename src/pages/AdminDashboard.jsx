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
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    contentBlocks: [{ type: 'text', content: '' }],
    faqItems: [{ question: '', answer: '' }],
    category: 'Tips',
    date: ''
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  // FAQ management
  const addFaqItem = () => setForm(p => ({
    ...p,
    faqItems: [...(p.faqItems || []), { question: '', answer: '' }]
  }))

  const removeFaqItem = (index) => setForm(p => ({
    ...p,
    faqItems: (p.faqItems || []).filter((_, i) => i !== index)
  }))

  const updateFaqItem = (index, field, value) => setForm(p => ({
    ...p,
    faqItems: (p.faqItems || []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  }))

  // Content block management
  const addTextBlock = () => setForm(p => ({
    ...p,
    contentBlocks: [...p.contentBlocks, { type: 'text', content: '' }]
  }))

  const addImageBlock = () => setForm(p => ({
    ...p,
    contentBlocks: [...p.contentBlocks, { type: 'image', content: '' }]
  }))

  const updateBlock = (index, field, value) => setForm(p => ({
    ...p,
    contentBlocks: p.contentBlocks.map((block, i) =>
      i === index ? { ...block, [field]: value } : block
    )
  }))

  const removeBlock = (index) => setForm(p => ({
    ...p,
    contentBlocks: p.contentBlocks.filter((_, i) => i !== index)
  }))

  const moveBlock = (index, direction) => setForm(p => {
    const blocks = [...p.contentBlocks]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= blocks.length) return p
    const temp = blocks[index]
    blocks[index] = blocks[newIndex]
    blocks[newIndex] = temp
    return { ...p, contentBlocks: blocks }
  })

  // Image upload for content blocks
  const uploadContentImage = async (index) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      setUploading(true)
      try {
        const url = await uploadToCloudinary(file, 'dearma/articles/content')
        if (url) {
          updateBlock(index, 'content', url)
          toast.success('Gambar diupload!')
        }
      } catch (err) {
        toast.error('Gagal upload: ' + err.message)
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }

  const save = async () => {
    if (!form.title || !form.excerpt) { toast.error('Judul dan ringkasan wajib diisi!'); return }
    try {
      // Convert contentBlocks to HTML content
      const htmlContent = form.contentBlocks.map(block => {
        if (block.type === 'image' && block.content) {
          return `<img src="${block.content}" alt="" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px;" />`
        } else if (block.type === 'text' && block.content) {
          return `<p>${block.content.replace(/\n/g, '<br>')}</p>`
        }
        return ''
      }).join('\n')

      // Convert FAQ items to string format for backward compatibility
      const faqString = (form.faqItems || [])
        .filter(item => item && item.question && item.question.trim())
        .map(item => item.question.trim())
        .join('\n')

      const data = {
        ...form,
        content: htmlContent, // Store as HTML for backward compatibility
        contentBlocks: form.contentBlocks, // Store structured data
        faq: faqString, // Store questions as string for backward compatibility
        faqItems: form.faqItems, // Store structured Q&A data
        date: form.date || new Date().toLocaleDateString('id-ID'),
        readTime: `${Math.max(1, Math.ceil((htmlContent.split(' ').length || 100) / 200))} menit`,
        updatedAt: serverTimestamp()
      }
      if (editing) {
        await updateDoc(doc(db, 'articles', editing), data)
        toast.success('Artikel diperbarui!')
      } else {
        await addDoc(collection(db, 'articles'), { ...data, createdAt: serverTimestamp() })
        toast.success('Artikel ditambahkan!')
      }
      setForm({
        title: '',
        excerpt: '',
        contentBlocks: [{ type: 'text', content: '' }],
        faqItems: [{ question: '', answer: '' }],
        category: 'Tips',
        date: ''
      })
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
    setForm({
      title: a.title,
      excerpt: a.excerpt,
      contentBlocks: a.contentBlocks || [{ type: 'text', content: a.content || '' }],
      faqItems: Array.isArray(a.faqItems) && a.faqItems.length > 0 ? a.faqItems : [{ question: '', answer: '' }],
      category: a.category || 'Tips',
      date: a.date || ''
    })
    setEditing(a.id); setShowForm(true)
  }

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn} onClick={() => { setForm({ title: '', excerpt: '', contentBlocks: [{ type: 'text', content: '' }], faqItems: [{ question: '', answer: '' }], category: 'Tips', date: '' }); setEditing(null); setShowForm(true) }}>
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
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{ flex: 1 }}>Konten Artikel</label>
              <button type="button" onClick={addTextBlock} className={styles.btnSmall} style={{ background: '#1A6EDB' }}>
                + Teks
              </button>
              <button type="button" onClick={addImageBlock} className={styles.btnSmall} style={{ background: '#1A7A45' }}>
                + Gambar
              </button>
            </div>

            <div className={styles.contentBlocks}>
              {form.contentBlocks.map((block, index) => (
                <div key={index} className={styles.contentBlock}>
                  <div className={styles.blockHeader}>
                    <span className={styles.blockType}>
                      {block.type === 'text' ? '📝 Teks' : '🖼️ Gambar'}
                    </span>
                    <div className={styles.blockActions}>
                      {index > 0 && (
                        <button type="button" onClick={() => moveBlock(index, -1)} className={styles.btnIcon}>↑</button>
                      )}
                      {index < form.contentBlocks.length - 1 && (
                        <button type="button" onClick={() => moveBlock(index, 1)} className={styles.btnIcon}>↓</button>
                      )}
                      <button type="button" onClick={() => removeBlock(index)} className={styles.btnIcon} style={{ color: '#E53935' }}>×</button>
                    </div>
                  </div>

                  {block.type === 'text' ? (
                    <textarea
                      value={block.content}
                      onChange={e => updateBlock(index, 'content', e.target.value)}
                      placeholder="Masukkan teks konten..."
                      className={styles.inp}
                      rows={4}
                    />
                  ) : (
                    <div className={styles.imageBlock}>
                      {block.content ? (
                        <div>
                          <img src={block.content} alt="" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }} />
                          <br />
                          <button type="button" onClick={() => uploadContentImage(index)} className={styles.btnSmall} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Ganti Gambar'}
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => uploadContentImage(index)} className={styles.btnSmall} disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Upload Gambar'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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

// --- Tours Tab (ivana-style with pax pricing, car selection, itinerary, etc) ---
const DEST_LIST_ADMIN = [
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
const MONTHS_S_ADMIN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const MONTHS_F_ADMIN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const emptyTourForm = () => ({
  name: '', destination: 'danautoba', type: 'open',
  description: '', duration: '', imageUrl: '', heroImage: '', gallery: [],
  paxPricing: [{ pax: 1, label: '1 Pax', price: 0, carType: '' }],
  included: '', excluded: '', notes: '', itinerary: '', location: '',
  lokasi_embed: '', faq: '', jadwal: {}, ulasan: [], tag: '', sortOrder: 99,
  faqItems: [{ question: '', answer: '' }]
})

function ToursTab({ tours, refresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTourForm())
  const [uploading, setUploading] = useState(false)
  const [galUploading, setGalUploading] = useState(false)

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // FAQ management
  const addFaqItem = () => setForm(p => ({
    ...p,
    faqItems: [...(p.faqItems || []), { question: '', answer: '' }]
  }))
  const removeFaqItem = (index) => setForm(p => ({
    ...p,
    faqItems: (p.faqItems || []).filter((_, i) => i !== index)
  }))
  const updateFaqItem = (index, field, value) => setForm(p => ({
    ...p,
    faqItems: (p.faqItems || []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  }))
  const formatText = (formatType) => {
    const textarea = document.getElementById('itinerary-editor')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let formattedText = selectedText
    let tag = ''

    switch (formatType) {
      case 'bold':
        tag = 'strong'
        break
      case 'italic':
        tag = 'em'
        break
      case 'underline':
        tag = 'u'
        break
      default:
        return
    }

    if (selectedText) {
      // Wrap selected text
      formattedText = `<${tag}>${selectedText}</${tag}>`
    } else {
      // Insert empty tags at cursor
      formattedText = `<${tag}></${tag}>`
    }

    // Update textarea value
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    upd('itinerary', newValue)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  const handleImageChange = async (e, field = 'imageUrl') => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'dearma/tours')
      if (url) { upd(field, url); toast.success('Gambar diupload!') }
    } catch (err) { toast.error('Gagal upload: ' + err.message) }
    finally { setUploading(false) }
  }

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setGalUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'dearma/tours/gallery')
      if (url) upd('gallery', [...(form.gallery || []), url])
    } catch (err) { toast.error('Gagal upload galeri: ' + err.message) }
    finally { setGalUploading(false) }
  }

  // Pax pricing
  const addPax    = () => upd('paxPricing', [...(form.paxPricing || []), { pax: 2, label: '2 Pax', price: 0, carType: '' }])
  const remPax    = (i) => upd('paxPricing', form.paxPricing.filter((_, x) => x !== i))
  const updPax    = (i, k, v) => {
    const a = [...form.paxPricing]
    a[i] = { ...a[i], [k]: ['price','pax'].includes(k) ? (parseInt(v)||0) : v }
    upd('paxPricing', a)
  }

  // Jadwal
  const updJadwal = (m, val) => upd('jadwal', { ...(form.jadwal || {}), [m]: val.split('\n').filter(Boolean) })

  const save = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Nama paket wajib diisi!'); return }
    try {
      const data = {
        ...form,
        paxPricing: (form.paxPricing || []).map(p => ({
          ...p,
          pax: Number(p.pax),
          price: Number(p.price),
          totalPrice: Number(p.price),
        })),
        price: form.paxPricing?.length ? Math.min(...form.paxPricing.map(p => Number(p.price)||0)) : 0,
        updatedAt: serverTimestamp()
      }
      if (editing) {
        await updateDoc(doc(db, 'tours', editing), data)
        toast.success('Paket tour diperbarui!')
      } else {
        await addDoc(collection(db, 'tours'), { ...data, createdAt: serverTimestamp() })
        toast.success('Paket tour ditambahkan!')
      }
      setForm(emptyTourForm()); setEditing(null); setShowForm(false)
      refresh()
    } catch (err) { toast.error('Gagal menyimpan: ' + err.message) }
  }

  const remove = async (id) => {
    if (!confirm('Hapus paket ini?')) return
    await deleteDoc(doc(db, 'tours', id))
    toast.success('Dihapus!'); refresh()
  }

  const edit = (t) => {
    setForm({
      name: t.name || '', destination: t.destination || 'danautoba', type: t.type || 'open',
      description: t.description || '', duration: t.duration || '',
      imageUrl: t.imageUrl || '', heroImage: t.heroImage || t.imageUrl || '',
      gallery: t.gallery || [],
      paxPricing: t.paxPricing?.length ? t.paxPricing.map(p => ({
        pax: p.pax, label: p.label || `${p.pax} Pax`,
        price: p.price || p.totalPrice || 0, carType: p.carType || ''
      })) : [{ pax: 1, label: '1 Pax', price: t.price || 0, carType: '' }],
      included: t.included || '', excluded: t.excluded || '', notes: t.notes || '',
      itinerary: t.itinerary || '', location: t.location || '',
      lokasi_embed: t.lokasi_embed || '', faq: t.faq || '',
      jadwal: t.jadwal || {}, ulasan: t.ulasan || [],
      tag: t.tag || '', sortOrder: t.sortOrder || 99,
      faqItems: Array.isArray(t.faqItems) && t.faqItems.length > 0 ? t.faqItems : [{ question: '', answer: '' }]
    })
    setEditing(t.id); setShowForm(true)
  }

  const S = {
    sec:  { background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.2rem', border: '1px solid #E8EFF9' },
    inp:  { width: '100%', padding: '.72rem .9rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontFamily: 'inherit', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' },
    lbl:  { fontWeight: 700, fontSize: '.82rem', color: '#374151', display: 'block', marginBottom: 4 },
    stit: { fontWeight: 800, color: '#081828', marginBottom: '1rem', fontSize: '1rem' },
  }
  const T = { blue: '#1A6EDB', green: '#1A7A45', red: '#E53935', gray: '#7B8DA0', teal: '#00BCD4' }

  return (
    <div>
      <div className={styles.tabHeader}>
        <button className={styles.addBtn}
          onClick={() => { setForm(emptyTourForm()); setEditing(null); setShowForm(true) }}>
          + Tambah Paket Tour Baru
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>{editing ? 'Edit Paket Tour' : 'Paket Tour Baru'}</h3>
          <form onSubmit={save}>

            {/* ─ BASIC ─ */}
            <div style={S.sec}>
              <div style={S.stit}>📋 Informasi Dasar</div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label style={S.lbl}>Nama Paket *</label>
                  <input style={S.inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Open Trip Danau Toba 2D1N" />
                </div>
                <div className={styles.field}>
                  <label style={S.lbl}>Destinasi</label>
                  <select style={S.inp} value={form.destination} onChange={e => upd('destination', e.target.value)}>
                    {DEST_LIST_ADMIN.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label style={S.lbl}>Tipe Trip</label>
                  <select style={S.inp} value={form.type} onChange={e => upd('type', e.target.value)}>
                    <option value="open">Open Trip</option>
                    <option value="private">Private Trip</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label style={S.lbl}>Durasi</label>
                  <input style={S.inp} value={form.duration} onChange={e => upd('duration', e.target.value)} placeholder="1 Hari / 2D1N" />
                </div>
                <div className={styles.field}>
                  <label style={S.lbl}>Tag (opsional)</label>
                  <input style={S.inp} value={form.tag} onChange={e => upd('tag', e.target.value)} placeholder="Terlaris, Promo, dll" />
                </div>
                <div className={styles.field}>
                  <label style={S.lbl}>Urutan Tampil</label>
                  <input type="number" style={S.inp} value={form.sortOrder} onChange={e => upd('sortOrder', parseInt(e.target.value)||99)} />
                </div>
              </div>
              <div className={styles.field} style={{ marginTop: '.8rem' }}>
                <label style={S.lbl}>Deskripsi</label>
                <textarea style={{ ...S.inp, minHeight: 100, resize: 'vertical' }}
                  value={form.description} onChange={e => upd('description', e.target.value)}
                  placeholder="Deskripsi lengkap paket tour…" rows={4} />
              </div>
            </div>

            {/* ─ PAX PRICING ─ */}
            <div style={S.sec}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div style={S.stit}>💰 Harga Per Pax &amp; Jenis Mobil</div>
                <button type="button" onClick={addPax}
                  style={{ background: T.green, color:'#fff', border:'none', padding:'.45rem 1rem', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'.82rem' }}>
                  + Tambah Harga
                </button>
              </div>
              <p style={{ color: T.gray, fontSize: '.8rem', marginBottom: '1rem' }}>
                💡 Open Trip: isi "1 Pax" harga per orang. Private Trip: isi 2 Pax, 4 Pax, dst. dengan harga berbeda per pax.
              </p>
              {(form.paxPricing || []).map((p, i) => (
                <div key={i} style={{ background:'#F8FAFF', borderRadius:12, padding:'1rem', marginBottom:'.8rem', border:'1px solid #E8EFF9' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr auto', gap:'.6rem', alignItems:'end' }}>
                    <div>
                      <label style={{ ...S.lbl, marginBottom:2 }}>Jml Pax</label>
                      <input type="number" min="1" style={{ ...S.inp, padding:'.5rem .6rem' }}
                        value={p.pax} onChange={e => updPax(i, 'pax', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ ...S.lbl, marginBottom:2 }}>Label</label>
                      <input style={{ ...S.inp, padding:'.5rem .6rem' }} value={p.label}
                        onChange={e => updPax(i, 'label', e.target.value)} placeholder="Min 2 Pax" />
                    </div>
                    <div>
                      <label style={{ ...S.lbl, marginBottom:2 }}>Harga / Orang (Rp)</label>
                      <input type="number" style={{ ...S.inp, padding:'.5rem .6rem', fontWeight:700, color:T.blue }}
                        value={p.price} onChange={e => updPax(i, 'price', e.target.value)} placeholder="350000" />
                    </div>
                    <div>
                      <label style={{ ...S.lbl, marginBottom:2 }}>Jenis Mobil</label>
                      <select style={{ ...S.inp, padding:'.5rem .6rem' }} value={p.carType}
                        onChange={e => updPax(i, 'carType', e.target.value)}>
                        <option value="">— Tidak ada</option>
                        <option>New Avanza 2024</option>
                        <option>Innova Reborn 2024</option>
                        <option>Hiace Premio 2024</option>
                        <option>Innova Zenix</option>
                        <option>Fortuner</option>
                        <option>Alphard HEV</option>
                        <option>Pajero</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => remPax(i)}
                      style={{ background:'#FEE2E2', color:T.red, border:'none', width:34, height:34, borderRadius:8, cursor:'pointer', fontWeight:700, alignSelf:'end' }}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ─ FOTO ─ */}
            <div style={S.sec}>
              <div style={S.stit}>🖼 Foto</div>
              <div className={styles.field} style={{ marginBottom:'1.2rem' }}>
                <label style={S.lbl}>Foto Hero (Utama)</label>
                <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'imageUrl')} className={styles.inp} disabled={uploading} />
                {(form.imageUrl) && <img src={form.imageUrl} alt="" style={{ marginTop:8, height:90, objectFit:'cover', borderRadius:10, display:'block' }} />}
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.7rem' }}>
                  <label style={S.lbl}>Galeri Foto</label>
                  <label style={{ display:'flex', alignItems:'center', gap:6, background:'#EFF6FF', color:T.blue, border:'none', padding:'.38rem .9rem', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'.8rem' }}>
                    {galUploading ? 'Uploading…' : '+ Upload Foto Galeri'}
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleGalleryUpload} disabled={galUploading} />
                  </label>
                </div>
                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                  {(form.gallery || []).map((url, i) => (
                    <div key={i} style={{ position:'relative' }}>
                      <img src={url} alt="" style={{ width:76, height:56, objectFit:'cover', borderRadius:8 }} />
                      <button type="button" onClick={() => upd('gallery', form.gallery.filter((_, x) => x !== i))}
                        style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:T.red, color:'#fff', border:'none', cursor:'pointer', fontSize:'.7rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ ITINERARY ─ */}
            <div style={S.sec}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={S.stit}>📅 Itinerary Perjalanan</div>
                <div className={styles.formatButtons}>
                  <button type="button" onClick={() => formatText('bold')} className={styles.formatBtn} title="Bold">
                    <strong>B</strong>
                  </button>
                  <button type="button" onClick={() => formatText('italic')} className={styles.formatBtn} title="Italic">
                    <em>I</em>
                  </button>
                  <button type="button" onClick={() => formatText('underline')} className={styles.formatBtn} title="Underline">
                    <u>U</u>
                  </button>
                </div>
              </div>
              <textarea
                id="itinerary-editor"
                style={{ ...S.inp, minHeight:120, resize:'vertical', fontSize:'.85rem' }}
                value={form.itinerary}
                onChange={e => upd('itinerary', e.target.value)}
                placeholder={`<strong>Hari 1:</strong> Pukul 07.00 berangkat dari Medan menuju Parapat
Check in hotel dan istirahat
<em>Makan malam bersama</em>

<strong>Hari 2:</strong> Pagi hari sarapan pagi
<u>Tour keliling Danau Toba</u>
Kunjungan ke Pulau Samosir`}
                rows={10}
              />
            </div>

            {/* ─ JADWAL (open trip only) ─ */}
            {form.type === 'open' && (
              <div style={S.sec}>
                <div style={S.stit}>🗓 Jadwal Open Trip (per Bulan)</div>
                <p style={{ color:T.gray, fontSize:'.8rem', marginBottom:'1rem' }}>Isi tanggal per baris, contoh: 04, 05</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'.8rem' }}>
                  {MONTHS_S_ADMIN.map(m => (
                    <div key={m}>
                      <label style={S.lbl}>{MONTHS_F_ADMIN[MONTHS_S_ADMIN.indexOf(m)]}</label>
                      <textarea style={{ ...S.inp, minHeight:70, resize:'vertical', fontSize:'.82rem' }}
                        value={(form.jadwal?.[m] || []).join('\n')}
                        onChange={e => updJadwal(m, e.target.value)}
                        placeholder={'04, 05\n11, 12'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─ INCLUDE / EXCLUDE / NOTES ─ */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.2rem' }}>
              <div style={S.sec}>
                <div style={{ ...S.stit, color: T.green }}>✅ Termasuk</div>
                <textarea style={{ ...S.inp, minHeight:100, resize:'vertical', fontSize:'.85rem' }}
                  value={form.included} onChange={e => upd('included', e.target.value)}
                  placeholder={'Transportasi PP\nGuide\nAir Mineral'} rows={4} />
              </div>
              <div style={S.sec}>
                <div style={{ ...S.stit, color: T.red }}>❌ Tidak Termasuk</div>
                <textarea style={{ ...S.inp, minHeight:100, resize:'vertical', fontSize:'.85rem' }}
                  value={form.excluded} onChange={e => upd('excluded', e.target.value)}
                  placeholder={'Tiket Pesawat\nMakan siang'} rows={4} />
              </div>
            </div>
            <div style={{ ...S.sec, marginBottom:'1.2rem' }}>
              <div style={{ ...S.stit, color: '#F59E0B' }}>⚠ Catatan Penting</div>
              <textarea style={{ ...S.inp, minHeight:80, resize:'vertical', fontSize:'.85rem' }}
                value={form.notes} onChange={e => upd('notes', e.target.value)}
                placeholder={'Peserta wajib hadir 15 menit sebelum keberangkatan\nBawa pakaian ganti'} rows={3} />
            </div>

            {/* ─ FAQ ─ */}
            <div style={S.sec}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={S.stit}>❓ FAQ</div>
                <button type="button" onClick={addFaqItem} className={styles.btnSmall} style={{ background: '#1A6EDB' }}>
                  + Tambah FAQ
                </button>
              </div>

              <div className={styles.faqItems}>
                {(form.faqItems || []).map((item, index) => (
                  <div key={index} className={styles.faqItem}>
                    <div className={styles.faqHeader}>
                      <span className={styles.faqNumber}>Q{index + 1}</span>
                      <button type="button" onClick={() => removeFaqItem(index)} className={styles.btnIcon} style={{ color: '#E53935' }}>×</button>
                    </div>

                    <div className={styles.faqFields}>
                      <div className={styles.faqField}>
                        <label style={{ ...S.lbl, fontSize: '.8rem' }}>Pertanyaan</label>
                        <input
                          style={{ ...S.inp, fontSize: '.85rem' }}
                          value={item.question}
                          onChange={e => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="Apakah ada biaya tambahan?"
                        />
                      </div>

                      <div className={styles.faqField}>
                        <label style={{ ...S.lbl, fontSize: '.8rem' }}>Jawaban</label>
                        <textarea
                          style={{ ...S.inp, minHeight: 60, resize: 'vertical', fontSize: '.85rem' }}
                          value={item.answer}
                          onChange={e => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="Jawaban lengkap untuk pertanyaan ini..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ LOKASI ─ */}
            <div style={S.sec}>
              <div style={S.stit}>📍 Lokasi</div>
              <div className={styles.field} style={{ marginBottom:'.8rem' }}>
                <label style={S.lbl}>Nama Lokasi</label>
                <input style={S.inp} value={form.location} onChange={e => upd('location', e.target.value)} placeholder="Danau Toba, Sumatera Utara" />
              </div>
              <label style={S.lbl}>Google Maps Embed URL</label>
              <input style={S.inp} value={form.lokasi_embed} onChange={e => upd('lokasi_embed', e.target.value)}
                placeholder="https://www.google.com/maps/embed?…" />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={uploading || galUploading}>
                {editing ? '💾 Update' : '💾 Simpan'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className={styles.dataTable}>
        <table>
          <thead>
            <tr>
              <th>Foto</th><th>Nama Paket</th><th>Tipe</th><th>Destinasi</th><th>Mulai</th><th>Durasi</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(t => {
              const mp = t.paxPricing?.length ? Math.min(...t.paxPricing.map(p => p.price || p.totalPrice || 0)) : (t.price || 0)
              const dest = DEST_LIST_ADMIN.find(d => d.id === t.destination)
              return (
                <tr key={t.id}>
                  <td>
                    {(t.imageUrl || t.heroImage)
                      ? <img src={t.imageUrl || t.heroImage} alt="" style={{ width:56, height:38, objectFit:'cover', borderRadius:6 }} />
                      : <div style={{ width:56, height:38, background:'#E8EFF9', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:'.65rem' }}>No img</div>
                    }
                  </td>
                  <td style={{ fontWeight:600, maxWidth:200 }}>{t.name}</td>
                  <td>
                    <span style={{ background: t.type==='open' ? '#DBEAFE':'#EDE9FE', color: t.type==='open'?'#1A6EDB':'#7C3AED', padding:'3px 10px', borderRadius:50, fontSize:'.74rem', fontWeight:700 }}>
                      {t.type==='open' ? 'Open' : 'Private'}
                    </span>
                  </td>
                  <td style={{ fontSize:'.84rem' }}>{dest?.name || t.destination || '-'}</td>
                  <td style={{ fontWeight:700, color:'#1A6EDB' }}>Rp {mp.toLocaleString('id-ID')}</td>
                  <td style={{ fontSize:'.84rem' }}>{t.duration || '-'}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => edit(t)} className={styles.editBtn}>✏ Edit</button>
                      <button onClick={() => remove(t.id)} className={styles.delBtn}>🗑</button>
                    </div>
                  </td>
                </tr>
              )
            })}
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
    homeHeader5: settings?.homeHeader5 || '',
    testimonialBgPhoto: settings?.testimonialBgPhoto || '',
    testimonialCardBg:  settings?.testimonialCardBg  || ''
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

        <h4 style={{ margin: '24px 0 12px', color: '#c9a227' }}>Testimoni — Background &amp; Warna Card</h4>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Foto Background Seksi Testimoni</label>
            <input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'testimonialBgPhoto')} className={styles.inp} disabled={uploading} />
            {form.testimonialBgPhoto && (
              <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                <img src={form.testimonialBgPhoto} alt="bg preview" style={{ width: '100%', maxWidth: 260, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(201,162,39,0.3)' }} />
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, testimonialBgPhoto: '' }))}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}
                >✕ Hapus</button>
              </div>
            )}
            <small style={{ color: '#8892a4', fontSize: 12, display: 'block', marginTop: 4 }}>Foto ini jadi background seluruh seksi testimoni</small>
          </div>
          <div className={styles.field}>
            <label>Warna Background Card Testimoni</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input
                type="color"
                value={form.testimonialCardBg || '#0d1528'}
                onChange={e => setForm(p => ({ ...p, testimonialCardBg: e.target.value }))}
                style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid rgba(201,162,39,0.3)', cursor: 'pointer', background: 'transparent', padding: 2 }}
              />
              <input
                type="text"
                name="testimonialCardBg"
                value={form.testimonialCardBg}
                onChange={handle}
                className={styles.inp}
                placeholder="#0d1528 atau rgba(13,21,40,0.9)"
                style={{ flex: 1 }}
              />
              {form.testimonialCardBg && (
                <button type="button" onClick={() => setForm(p => ({ ...p, testimonialCardBg: '' }))}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#8892a4', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Reset</button>
              )}
            </div>
            <div style={{ marginTop: 8, padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: form.testimonialCardBg || 'rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 12, color: '#8892a4' }}>Preview Card</div>
              <div style={{ fontSize: 14, color: '#f0f4ff', marginTop: 4 }}>"Testimoni pelanggan akan tampil seperti ini..."</div>
            </div>
            <small style={{ color: '#8892a4', fontSize: 12, display: 'block', marginTop: 4 }}>Kosongkan untuk gunakan warna default (gelap)</small>
          </div>
        </div>

        <div className={styles.formActions}>
          <button onClick={save} className={styles.saveBtn}>Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  )
}
