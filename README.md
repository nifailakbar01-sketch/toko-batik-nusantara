# Toko Batik Nusantara

Website dinamis toko batik — dibuat untuk **Ujian Praktik Kompetensi skema Junior Web Developer**.

Stack: **Backend REST API (Node.js + Express + MySQL)** + **Frontend React (Vite)**.

Proyek ini terbagi menjadi dua bagian terpisah yang berjalan sebagai dua server berbeda:

```
project/
├── backend/    # REST API (Express + MySQL, JSON only)
└── frontend/   # Aplikasi React (Vite) — toko publik + panel admin
```

## Fitur

**Sisi Pembeli (Publik)**
- Beranda dengan produk unggulan & kategori
- Katalog produk dengan filter kategori & pencarian
- Detail produk
- Keranjang belanja (tambah, ubah jumlah, hapus)
- Checkout dengan validasi form (nama, email, no. HP, alamat)
- Pilihan metode pembayaran dinamis:
  - **Transfer Bank** → menampilkan nomor rekening penjual (BCA, Mandiri, BRI) + tombol salin
  - **E-Wallet** → menampilkan gambar **QRIS** penjual + tombol unduh
  - **COD** → info bayar di tempat (tanpa bukti pembayaran)
- Unggah **foto bukti pembayaran** di halaman konfirmasi (JPG/PNG/WEBP, maks 2MB) dengan pratinjau
- Halaman sukses pesanan
- Responsive (mobile & desktop)

**Sisi Admin**
- Login admin (password di-hash dengan bcrypt)
- Dashboard (statistik produk, kategori, transaksi, pendapatan)
- CRUD Produk (dengan upload gambar)
- CRUD Kategori
- Kelola Transaksi (ubah status: menunggu pembayaran → menunggu konfirmasi → diproses → dikirim → selesai/dibatalkan)
- Melihat foto bukti pembayaran yang diunggah pembeli beserta catatannya
- Laporan Penjualan (filter tanggal + produk terlaris)

## Cara Menjalankan

### 1. Backend (API)

```bash
cd backend
cp .env.example .env      # sesuaikan kredensial database & CLIENT_URL
npm install
mysql -u root -p < database/schema.sql
node database/seed.js     # buat akun admin default (admin / admin123)
npm start                 # jalan di http://localhost:3000
```

Semua endpoint API berada di bawah prefix `/api` (contoh: `/api/katalog`, `/api/admin/login`).
Gambar produk yang diunggah dapat diakses lewat `/uploads/<nama_file>`.

### 2. Frontend (React)

Buka terminal baru:

```bash
cd frontend
cp .env.example .env      # pastikan VITE_API_URL mengarah ke backend (default: http://localhost:3000/api)
npm install
npm run dev                # jalan di http://localhost:5173
```

Buka browser ke `http://localhost:5173`.

Login admin: `http://localhost:5173/admin/login` (username: `admin`, password: `admin123`)

## Catatan untuk Asesor

- Frontend dan backend berkomunikasi lewat REST API berformat JSON (fetch dengan `credentials: 'include'`), backend mengatur CORS agar hanya menerima origin frontend (`CLIENT_URL`).
- Sesi login admin dan keranjang belanja tetap disimpan di server memakai `express-session` (cookie), bukan disimpan di localStorage.
- Validasi form checkout & produk menggunakan `express-validator` di sisi backend, ditampilkan kembali sebagai pesan error di form React.
- Transaksi checkout dijalankan sebagai **database transaction** (commit/rollback) agar stok tidak berkurang ganda saat terjadi kegagalan.
- Password admin di-hash menggunakan `bcryptjs`, tidak disimpan dalam bentuk plain text.
- Struktur backend tetap dipisah per tanggung jawab (routes → controllers → query database).
- Struktur frontend dipisah per tanggung jawab: `api/` (komunikasi ke backend), `context/` (state global keranjang & sesi admin), `components/` (elemen UI yang dipakai berulang), `pages/` (satu halaman = satu route).


## Konfigurasi Pembayaran

Nomor rekening dan data QRIS disimpan di satu file agar mudah diganti:

- **Rekening bank & QRIS:** `backend/config/pembayaran.js`
- **Gambar QRIS:** `backend/public/img/qris.png` — ganti dengan file QRIS asli toko (nama file harus sama, atau ubah nilai `qris.gambar` di config).

> Gambar QRIS bawaan hanya **contoh/placeholder** dan tidak bisa dipindai. Ganti sebelum dipakai sungguhan.

### Alur Pembayaran

1. Pembeli memilih metode pembayaran di halaman checkout → detail pembayaran langsung muncul (rekening atau QRIS).
2. Pembeli menekan **Buat Pesanan** → transaksi tersimpan dengan status `menunggu_pembayaran`.
3. Di halaman konfirmasi, pembeli mengunggah foto bukti pembayaran → status berubah jadi `menunggu_konfirmasi`.
4. Admin melihat bukti di **Detail Transaksi** lalu mengubah status jadi `diproses`.

### Migrasi Database

Jika database sudah dibuat sebelum fitur ini ada, jalankan:

```bash
mysql -u root -p toko_batik_nusantara < backend/database/migration-bukti-pembayaran.sql
```

Kalau membuat database baru dari `backend/database/schema.sql`, migrasi ini tidak perlu dijalankan.
