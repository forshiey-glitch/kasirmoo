# 🏮 LongMen POS (龍門客棧) - Chinese Modern Point of Sale

Aplikasi Kasir (Point of Sale) modern bertema **Chinese Modern** bernuansa elegan ala WeChat/Alipay Fintech Tiongkok (Merah Kaisar `#C8102E`, Emas Dinasti `#D4AF37`, Krem Sutra `#FAF3E0`). Dibangun dengan **React 19**, **Vite**, **Tailwind CSS**, terintegrasi ke **Firebase** (Authentication & Cloud Firestore) dan **Cloudinary** (Hosting Upload Gambar Bukti QRIS & Foto Menu).

Proyek ini dirancang khusus untuk siap di-push ke **GitHub**, di-deploy otomatis ke **Vercel**, dan memiliki sistem fallback lokal cerdas agar langsung bisa ditest & didemokan bahkan sebelum akun Firebase dihubungkan.

---

## ✨ Fitur Unggulan

1. **Desain Chinese Modern Berkelas 🏮**
   - Palet warna kaisar Tiongkok: Merah `#C8102E`, Merah Gelap `#8B0000`, Emas `#D4AF37`, Krem `#FAF3E0`, Hijau Giok `#2E7D32` (Lunas), Amber `#F57C00` (Pending).
   - Tipografi otentik: Google Fonts *Ma Shan Zheng* (kaligrafi) dan *Noto Sans SC* (body).
   - Ornamen awan keberuntungan SVG, motif kisi-kisi (lattice) elegan, border emas berkilau, micro-animation responsif.

2. **Responsif Sempurna di 3 Breakpoint 📱💻🖥️**
   - **Mobile (≤ 767px):** Bottom navigation 4 tab, grid 2 kolom, keranjang belanja bottom sheet geser mulus, tombol ramah jempol (min 44px), modal fullscreen.
   - **Tablet (768px – 1023px):** Split layout 2 kolom (60% katalog menu, 40% panel keranjang persisten), split view chat (daftar kontak kiri, obrolan kanan).
   - **Desktop (≥ 1024px):** Sidebar navigasi kiri (bisa di-collapse), grid menu 4 kolom + keranjang kanan 380px, chat 3 panel, dashboard analitik 4 kolom statistik dengan filter interaktif.

3. **Sistem Kasir Cepat & Keranjang Pintar 🛒**
   - Pencarian real-time dan filter kategori (Dim Sum, Makanan Utama, Mie & Nasi, Teh Tradisional & Minuman, Pencuci Mulut).
   - Input catatan pesanan per item atau per transaksi, diskon, kalkulasi PPN/pajak otomatis.
   - Pilihan metode bayar Tunai (Cash) dengan kalkulator uang kembalian instan atau QRIS.
   - Eksekusi transaksi atomik via Firestore `writeBatch` untuk konsistensi inventori/stok.
   - Cetak struk belanja digital & resi fisik bergaya thermal receipt.

4. **Tampilan & Manajemen QRIS Toko Dinamis 💳**
   - Menampilkan QRIS resmi toko di layar kasir/pelanggan.
   - Mengambil URL dinamis dari Firestore `settings/qris`.
   - Fallback otomatis ke `/qris-toko.png` di folder `public/`.
   - Tombol perbesar QRIS ke modal fullscreen kontras tinggi agar gampang di-scan pembeli.
   - **Admin Settings:** Admin dapat mengganti gambar QRIS toko kapan saja via form upload ke Cloudinary tanpa perlu deploy ulang kode!

5. **Upload Bukti Pembayaran QRIS via Cloudinary 📸**
   - **Kamera Langsung:** Buka webcam/kamera HP langsung di browser dengan switch kamera depan/belakang, preview capture, dan opsi ambil ulang (fallback ke file input `capture="environment"` jika kamera browser diblokir).
   - **Pilih dari Galeri / File:** Drag & drop atau upload gambar bukti transfer.
   - **Kompresi Otomatis di Browser:** Gambar dikompresi otomatis via HTML5 Canvas (max 1200px, quality 0.8) sebelum diunggah ke endpoint Cloudinary (`https://api.cloudinary.com/v1_1/v2evmutn/image/upload`, preset unsigned: `kasir_qris`).
   - Progress bar gradasi emas dan preview hasil kompresi (menampilkan ukuran sebelum & sesudah kompresi).

6. **Chat Internal Real-Time Kasir & Admin 💬**
   - Komunikasi instan antara kasir di lantai toko dan admin/manager di kantor.
   - Broadcast pesan ke semua staf atau chat personal per kasir.
   - Fitur "Tanyakan Transaksi Ini" langsung menautkan ID transaksi ke dalam ruang obrolan.
   - Dukungan lampiran foto/dokumen via Cloudinary dengan kompresi thumbnail & zoom modal.
   - Badge notifikasi belum dibaca real-time.

7. **Panel Admin Lengkap 👑**
   - **Dashboard Ringkasan:** Omset harian, total transaksi, total item terjual, kasir teraktif, grafik ringkasan.
   - **Manajemen Menu (CRUD):** Tambah menu baru, edit harga & stok, nonaktifkan menu habis, upload foto.
   - **Riwayat & Verifikasi Transaksi:** Filter tanggal, kasir, metode bayar; verifikasi pembayaran QRIS (pending → selesai).
   - **Manajemen Karyawan / User:** Tambah kasir baru, reset status aktif, atur hak akses role.
   - **Pengaturan Toko:** Ubah nama restoran, tarif pajak, informasi header struk, ganti poster QRIS toko.

---

## 📋 Prasyarat Sistem

- **Node.js**: Versi 18.0.0 atau lebih baru ([Download Node.js](https://nodejs.org/))
- **NPM** atau **Yarn** / **PNPM**
- Akun **GitHub** ([github.com](https://github.com/))
- Akun **Firebase Console** ([console.firebase.google.com](https://console.firebase.google.com/))
- Akun **Vercel** ([vercel.com](https://vercel.com/))

---

## 🚀 Panduan Setup & Jalankan di Komputer Lokal

### 1. Clone & Masuk ke Folder Proyek
```bash
git clone https://github.com/USERNAME-ANDA/kasir-app.git
cd kasir-app
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Buat File Konfigurasi `.env`
Salin template `.env.example` ke file `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan konfigurasi dari Firebase Console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=nama-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nama-project
VITE_FIREBASE_STORAGE_BUCKET=nama-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```
*(Catatan: Jika `.env` belum diisi, aplikasi tetap berjalan dalam **Mode Demo Offline** dengan data contoh lengkap restoran Chinese).*

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang tertera di terminal).

---

## 🔥 Panduan Konfigurasi Firebase

### 1. Buat Project Firebase Baru
1. Buka [Firebase Console](https://console.firebase.google.com/) dan klik **Add project**.
2. Masukkan nama project (contoh: `longmen-pos`), lalu ikuti langkahnya sampai selesai.

### 2. Aktifkan Firebase Authentication
1. Di menu samping kiri, klik **Build** > **Authentication** > **Get Started**.
2. Pada tab **Sign-in method**, pilih **Email/Password**.
3. Aktifkan sakelar **Email/Password** (opsi Email link biarkan mati), lalu klik **Save**.

### 3. Aktifkan Cloud Firestore
1. Klik **Build** > **Firestore Database** > **Create database**.
2. Pilih lokasi region terdekat (misal: `asia-southeast2` untuk Jakarta atau `asia-east1`).
3. Pilih **Start in test mode** atau langsung terapkan aturan keamanan dari file `firestore.rules` di proyek ini pada tab **Rules**.

### 4. Aktifkan Cloud Storage
1. Klik **Build** > **Storage** > **Get Started**.
2. Ikuti instruksi pembuatan bucket default.
3. Buka tab **Rules** dan terapkan aturan keamanan dari file `storage.rules`.

### 5. Dapatkan Kunci Konfigurasi Web App
1. Klik ikon ⚙️ **Project settings** (di samping menu kiri atas).
2. Di bagian bawah tab **General**, pada bagian **Your apps**, klik ikon Web ( `</>` ).
3. Beri nickname (contoh: `LongMen POS Web`), lalu klik **Register app**.
4. Salin nilai `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` ke file `.env` Anda sesuai format `VITE_FIREBASE_*`.

---

## 🐙 Panduan Push ke GitHub

Jika Anda belum membuat repository di GitHub:

1. Buka [GitHub New Repository](https://github.com/new).
2. Beri nama repository (contoh: `longmen-chinese-pos`).
3. Pilih **Public** atau **Private**, lalu klik **Create repository**.
4. Di terminal folder proyek Anda di komputer:

```bash
# Inisialisasi git (jika belum ada folder .git)
git init

# Tambahkan semua file (file .env otomatis diabaikan berkat .gitignore)
git add .

# Buat commit perdana
git commit -m "feat: inisialisasi aplikasi kasir POS Chinese modern lengkap"

# Ganti branch utama menjadi main
git branch -M main

# Sambungkan ke remote GitHub Anda (ganti URL di bawah dengan milik Anda)
git remote add origin https://github.com/USERNAME-ANDA/longmen-chinese-pos.git

# Push ke GitHub
git push -u origin main
```

---

## 🌐 Panduan Deploy ke Vercel (Auto Deploy Tiap Push)

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Cari repository `longmen-chinese-pos` yang baru Anda push, lalu klik **Import**.
4. Di bagian **Build and Output Settings**, biarkan default (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
5. Buka bagian **Environment Variables** (Sangat Penting!):
   Tambahkan satu per satu variabel yang sama persis seperti di `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Klik **Deploy**.
7. Dalam ~1 menit, aplikasi POS Anda sudah aktif di internet dengan domain gratis `https://nama-proyek-anda.vercel.app`! Setiap kali Anda melakukan `git push` ke GitHub, Vercel akan otomatis meng-update aplikasinya.

---

## 👤 Membuat Akun Admin Pertama di Firebase

Setelah aplikasi aktif, Anda perlu membuat akun Admin pertama:

1. Di **Firebase Console**, buka **Authentication** > **Users** > klik **Add user**.
2. Masukkan Email (contoh: `admin@longmen.com`) dan Password (minimal 6 karakter). Klik **Add user** lalu salin **User UID** pengguna tersebut.
3. Buka **Firestore Database**, klik **Start collection** dengan nama `users`.
4. Masukkan **Document ID** dengan UID yang baru disalin, lalu tambahkan field:
   - `username`: string -> `admin`
   - `nama_lengkap`: string -> `Manager Utama LongMen`
   - `email`: string -> `admin@longmen.com`
   - `role`: string -> `admin`
   - `status_aktif`: boolean -> `true`
   - `avatar_url`: string -> `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
5. Sekarang Anda bisa login ke aplikasi menggunakan email & password admin tersebut!
6. Untuk kasir baru, Anda bisa mendaftarkannya langsung dari halaman **Admin User Management** di dalam aplikasi.

---

## 🖼️ Catatan Penting Gambar QRIS Toko

- Gambar QRIS default toko tersimpan di `public/qris-toko.png`.
- Anda dapat mengganti file `public/qris-toko.png` langsung dengan gambar barcode QRIS statis toko Anda sebelum di-push ke GitHub.
- **Tanpa deploy ulang:** Admin toko dapat mengganti gambar QRIS kapan pun melalui menu **Admin > Pengaturan (Settings)**. Gambar baru akan diunggah ke Firebase Storage (`assets/qris_...`) dan disimpan URL-nya di Firestore `settings/qris`. Semua perangkat kasir akan otomatis menampilkan QRIS terbaru secara real-time!
- *Penting:* Jangan gunakan link sharing Google Drive karena Google Drive memblokir akses direct cross-origin (CORS). Gunakan fitur upload di menu Settings atau file lokal `public/qris-toko.png`.

---

## 📁 Struktur Direktori

```
kasir-app/
├── .env.example              # Template variabel lingkungan Firebase
├── .gitignore                # Filter file rahasia & build untuk git
├── README.md                 # Dokumentasi komprehensif proyek
├── package.json              # Dependensi npm & skrip vite
├── tsconfig.json             # Konfigurasi TypeScript
├── vite.config.ts            # Konfigurasi Vite & Tailwind
├── index.html                # Entry point HTML & Google Fonts
├── firestore.rules           # Aturan keamanan database Firestore
├── storage.rules             # Aturan keamanan upload Storage
├── firebase-blueprint.json   # Skema metadata database
├── public/
│   └── qris-toko.png         # Gambar QRIS default toko
└── src/
    ├── main.tsx              # Entry point React
    ├── App.tsx               # Router & state autentikasi global
    ├── index.css             # Tailwind & ornamen Chinese modern
    ├── lib/
    │   ├── firebase.ts       # Inisialisasi Firebase & export auth, db, storage
    │   ├── rupiah.ts         # Formatter mata uang Rupiah (IDR)
    │   └── date.ts           # Formatter tanggal & waktu Indonesia
    ├── hooks/
    │   ├── useBreakpoint.ts  # Deteksi mobile (≤767), tablet (768-1023), desktop (≥1024)
    │   ├── useAuth.ts        # Hook autentikasi & profil role
    │   └── useChat.ts        # Hook pesan real-time
    ├── components/
    │   ├── Layout/
    │   │   ├── Header.tsx           # Bar atas bertema Chinese, ornamen awan, lencana notif
    │   │   ├── MobileNav.tsx        # Bottom bar 4 tab untuk layar HP
    │   │   └── DesktopSidebar.tsx   # Sidebar lipat untuk layar komputer
    │   ├── Common/
    │   │   ├── Modal.tsx            # Modal popup transparan blur border emas
    │   │   ├── Toast.tsx            # Notifikasi mengambang (sukses, error, info)
    │   │   ├── ConfirmDialog.tsx    # Dialog konfirmasi aksi berbahaya
    │   │   ├── Avatar.tsx           # Avatar foto / inisial kaligrafi
    │   │   └── LoadingSkeleton.tsx  # Kerangka animasi loading
    │   ├── Menu/
    │   │   ├── MenuCard.tsx         # Kartu menu dengan badge stok & harga emas
    │   │   ├── MenuGrid.tsx         # Grid responsif dengan tab kategori
    │   │   ├── CartPanel.tsx        # Panel keranjang belanja & kalkulator tunai
    │   │   └── BottomSheet.tsx      # Sheet keranjang geser bawah khusus HP
    │   ├── QRIS/
    │   │   ├── QRISDisplay.tsx      # Tampilan barcode QRIS toko + tombol perbesar
    │   │   ├── UploadBuktiQRIS.tsx  # Upload bukti transfer dengan kompresi canvas
    │   │   └── CameraModal.tsx      # Kamera browser langsung + switch depan/belakang
    │   └── Chat/
    │       ├── ChatBubble.tsx       # Balon chat merah kaisar vs krem sutra
    │       ├── ChatInput.tsx        # Textarea auto-resize + kamera + attach
    │       ├── ChatList.tsx         # Daftar percakapan staf & kasir
    │       └── ChatWindow.tsx       # Ruang obrolan pesan lengkap
    └── pages/
        ├── Login.tsx                # Halaman masuk kasir & admin
        ├── Kasir.tsx                # Halaman utama POS penjualan
        ├── AdminDashboard.tsx       # Statistik omset & grafik penjualan
        ├── AdminMenu.tsx            # CRUD daftar menu & stok makanan
        ├── AdminTransaksi.jsx       # Riwayat transaksi & verifikasi QRIS
        ├── AdminUser.tsx            # Kelola akun staf kasir & admin
        ├── AdminSettings.tsx        # Ganti gambar QRIS toko & profil resto
        └── Chat.tsx                 # Halaman chat internal responsif 3 layout
```

---

## 🛠️ Troubleshooting Umum

1. **Error: "Firebase: Error (auth/invalid-api-key)"**
   - Periksa file `.env` di lokal atau menu *Environment Variables* di Vercel. Pastikan `VITE_FIREBASE_API_KEY` terisi dengan benar tanpa tanda petik ekstra.
   
2. **Kamera Tidak Mau Terbuka di HP**
   - Fitur kamera `navigator.mediaDevices.getUserMedia` mengharuskan koneksi **HTTPS** yang aman (sudah otomatis HTTPS saat di-deploy ke Vercel atau via `localhost`).
   - Jika pengguna memblokir izin kamera, aplikasi otomatis mengalihkan ke tombol *Pilih File* standar (`<input capture="environment">`).

3. **Gambar Bukti QRIS Gagal Terupload**
   - Pastikan Firebase Storage sudah diaktifkan di Firebase Console dan aturan `storage.rules` sudah dipasang agar mengizinkan pengguna yang login untuk mengunggah file.

4. **Koneksi Offline / Belum Punya Akun Firebase**
   - Anda dapat menekan tombol **"Gunakan Akun Demo"** di halaman Login untuk langsung menjelajahi seluruh fitur aplikasi menggunakan data simulasi lokal.

---
*Dibuat dengan dedikasi untuk kemudahan operasional restoran modern berkarakter.* 🏮
