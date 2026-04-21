# 🚗 Dearma Sewa Mobil Medan

Website CRM rental mobil modern untuk **Dearma Sewa Mobil Medan** — dibangun dengan React + Vite + Firebase + Vercel.

---

## ✨ Fitur Lengkap

- 🎬 **Animasi Otomotif** — Hero section dengan partikel, road lines, orbit logo, dan shimmer effect
- 🚘 **Halaman Armada** — 8 unit mobil dengan filter kategori, modal detail, harga lengkap
- 📝 **Blog/Artikel** — CRUD artikel dari admin, ditampilkan publik dengan filter kategori
- 💬 **Testimoni** — Dikelola via admin dashboard, ditampilkan di homepage
- 📩 **Form Kontak** — Tersimpan ke Firestore, bisa dibalas langsung via WhatsApp
- 🔐 **Admin Panel** — Login Firebase Auth, dashboard statistik, kelola artikel/testimoni/pesan
- 📍 **Google Maps** — Embed lokasi toko
- 🟢 **Tombol WhatsApp** — Floating button dengan pesan otomatis kontekstual per mobil
- 📱 **Instagram & Facebook** — Tombol connect di footer dan homepage
- 📱 **Responsif** — Mobile-first, tampilan optimal di semua perangkat
- 🔍 **SEO Lengkap** — Meta tags, OG, Twitter Card, Schema.org LocalBusiness
- 🛡️ **Keamanan** — Security headers, Firestore rules, Firebase Auth

---

## 🚀 Cara Deploy

### 1. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Buat project baru
3. Aktifkan **Authentication** → Email/Password
4. Buat akun admin: Authentication → Add User
5. Aktifkan **Firestore Database**
6. Copy konfigurasi Firebase (Project Settings → Your Apps → Web)
7. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 2. Setup Environment Variables

Buat file `.env` di root project:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install & Development

```bash
npm install
npm run dev
```

### 4. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard:
# Settings → Environment Variables → tambahkan semua VITE_FIREBASE_*
```

Atau connect GitHub repo ke Vercel untuk auto-deploy.

### 5. Deploy ke GitHub

```bash
git init
git add .
git commit -m "feat: initial Dearma Sewa Mobil Medan website"
git branch -M main
git remote add origin https://github.com/username/dearma-sewa-mobil.git
git push -u origin main
```

---

## 📁 Struktur Proyek

```
dearma-sewa/
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   └── cars/          # Foto mobil
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── WhatsAppButton.jsx
│   │   └── ProtectedRoute.jsx
│   ├── data/
│   │   └── cars.js        # Data armada mobil
│   ├── firebase/
│   │   └── config.js      # Firebase init
│   ├── pages/
│   │   ├── Home.jsx       # Homepage dengan animasi
│   │   ├── Fleet.jsx      # Daftar armada + filter
│   │   ├── Articles.jsx   # Blog/artikel
│   │   ├── ArticleDetail.jsx
│   │   ├── Contact.jsx    # Kontak + form
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── NotFound.jsx
│   ├── styles/
│   │   └── globals.css    # Global styles + variables
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html             # SEO meta tags
├── vercel.json            # Vercel config + security headers
├── firestore.rules        # Firestore security rules
├── .env.example
└── package.json
```

---

## 🛠️ Kustomisasi

### Ganti Nomor WhatsApp
Cari `6281234567890` dan ganti di:
- `src/components/Navbar.jsx`
- `src/components/WhatsAppButton.jsx`
- `src/pages/Fleet.jsx`
- `src/pages/Home.jsx`
- `src/pages/Contact.jsx`

### Ganti Data Armada Mobil
Edit `src/data/cars.js` — tambah/ubah mobil dan harga.

### Ganti Lokasi Maps
Edit `src/pages/Home.jsx` → komponen `Location` → ubah `src` iframe Google Maps.

### Ganti Link Social Media
Cari `dearmasewamobil` di semua file dan ganti dengan username Anda.

---

## 🔒 Keamanan

- Firebase Auth untuk admin login
- Firestore Rules: hanya admin yang bisa write artikel/testimoni
- Form kontak divalidasi di Firestore Rules (field required, max length)
- Security Headers via `vercel.json`: X-Frame-Options, CSP, HSTS, dll.
- Environment variables tidak terekspos ke client (prefix `VITE_` aman untuk public config)

---

## 📞 Support

Dibuat untuk **Dearma Sewa Mobil Medan**  
WhatsApp: 0812-3456-7890  
Medan, Sumatera Utara
