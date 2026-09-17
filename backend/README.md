# Toko Batik Nusantara

Website dinamis toko batik — dibuat untuk **Ujian Praktik Kompetensi skema Junior Web Developer**.

Stack: **Node.js + Express + MySQL** (EJS sebagai template engine).

## Fitur

**Sisi Pembeli (Publik)**
- Beranda dengan produk unggulan & kategori
- Katalog produk dengan filter kategori & pencarian
- Detail produk
- Keranjang belanja (tambah, ubah jumlah, hapus)
- Checkout dengan validasi form (nama, email, no. HP, alamat)
- Halaman sukses pesanan
- Responsive (mobile & desktop)

**Sisi Admin**
- Login admin (password di-hash dengan bcrypt)
- Dashboard (statistik produk, kategori, transaksi, pendapatan)
- CRUD Produk (dengan upload gambar)
- CRUD Kategori
- Kelola Transaksi (ubah status: menunggu pembayaran → diproses → dikirim → selesai/dibatalkan)
- Laporan Penjualan (filter tanggal + produk terlaris)

## Struktur Folder

```
toko-batik-nusantara/
├── config/db.js              # Koneksi database (mysql2 pool)
├── controllers/              # Logika bisnis, terpisah dari routes
├── middleware/                # Auth admin & upload gambar (multer)
├── routes/                    # index.js (publik) & admin.js (admin)
├── views/                      # Template EJS (public + admin)
├── public/                     # CSS, JS, gambar upload
├── database/schema.sql        # Struktur tabel + data contoh
├── database/seed.js           # Membuat akun admin default
└── server.js                   # Entry point aplikasi
```

## Cara Instalasi & Menjalankan

### 1. Persiapan Database
Buka XAMPP/Laragon, aktifkan MySQL, lalu impor `database/schema.sql` (lewat phpMyAdmin atau command line):

```bash
mysql -u root -p < database/schema.sql
```

Ini akan otomatis membuat database `toko_batik_nusantara` beserta tabel dan beberapa data produk batik contoh.

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`, lalu sesuaikan kredensial database Anda:

```bash
cp .env.example .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Buat Akun Admin
Jalankan sekali untuk membuat akun admin default (username: `admin`, password: `admin123`):

```bash
node database/seed.js
```

### 5. Jalankan Server

```bash
npm start
```

Buka browser ke `http://localhost:3000`.

Login admin: `http://localhost:3000/admin/login`

## Catatan untuk Asesor

- Validasi form checkout menggunakan `express-validator` (nama, email, nomor HP, alamat).
- Transaksi checkout dijalankan sebagai **database transaction** (commit/rollback) agar stok tidak berkurang ganda saat terjadi kegagalan.
- Password admin di-hash menggunakan `bcryptjs`, tidak disimpan dalam bentuk plain text.
- Struktur kode dipisah per tanggung jawab (routes → controllers → model query ke database) mengikuti prinsip pemrograman terstruktur.
- Library pihak ketiga yang digunakan: express, express-session, express-validator, bcryptjs, multer, ejs, connect-flash, method-override.
