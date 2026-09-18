-- =========================================================
-- Database import file for Railway / MySQL
-- Gabungan dari schema.sql + migration-bukti-pembayaran.sql
-- Import ke database yang sudah dibuat di Railway
-- =========================================================

-- ---------------------------------------------------------
-- Tabel Admin (Login Admin)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabel Pelanggan (akun pembeli - register & login mandiri)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pelanggan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabel Kategori Produk
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabel Produk
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id INT NOT NULL,
  nama_produk VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  deskripsi TEXT,
  harga DECIMAL(12,2) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  gambar VARCHAR(255) DEFAULT 'default-produk.jpg',
  motif VARCHAR(100),
  bahan VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Tabel Transaksi (Order / Checkout)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pelanggan_id INT DEFAULT NULL,
  kode_transaksi VARCHAR(30) NOT NULL UNIQUE,
  nama_pembeli VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  alamat TEXT NOT NULL,
  total_harga DECIMAL(12,2) NOT NULL,
  status ENUM('menunggu_pembayaran','menunggu_konfirmasi','diproses','dikirim','selesai','dibatalkan') DEFAULT 'menunggu_pembayaran',
  metode_pembayaran VARCHAR(50) DEFAULT 'transfer_bank',
  bukti_transfer VARCHAR(255) DEFAULT NULL,
  tanggal_bukti DATETIME DEFAULT NULL,
  catatan_pembayaran VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- Tabel Detail Transaksi (Item per transaksi)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL,
  produk_id INT NOT NULL,
  nama_produk VARCHAR(150) NOT NULL,
  harga_satuan DECIMAL(12,2) NOT NULL,
  jumlah INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- =========================================================
-- Data Contoh (Seed) - Kategori
-- =========================================================
INSERT INTO kategori (nama_kategori, slug, deskripsi) VALUES
('Batik Tulis', 'batik-tulis', 'Batik yang dibuat dengan cara ditulis menggunakan canting, motif eksklusif dan detail halus'),
('Batik Cap', 'batik-cap', 'Batik yang dibuat menggunakan cap tembaga, lebih terjangkau dengan motif konsisten'),
('Kemeja Batik', 'kemeja-batik', 'Kemeja siap pakai berbahan kain batik untuk pria dan wanita'),
('Aksesoris Batik', 'aksesoris-batik', 'Selendang, totebag, dan aksesoris berbahan batik')
ON DUPLICATE KEY UPDATE
  nama_kategori = VALUES(nama_kategori),
  deskripsi = VALUES(deskripsi);

-- =========================================================
-- Data Contoh (Seed) - Produk
-- =========================================================
INSERT INTO produk (kategori_id, nama_produk, slug, deskripsi, harga, stok, gambar, motif, bahan) VALUES
(1, 'Batik Tulis Motif Parang Rusak', 'batik-tulis-parang-rusak', 'Kain batik tulis premium dengan motif Parang Rusak khas Yogyakarta, dikerjakan selama 3 minggu oleh pengrajin berpengalaman.', 850000, 8, 'batik-parang.jpg', 'Parang Rusak', 'Katun Primisima'),
(1, 'Batik Tulis Motif Sekar Jagad', 'batik-tulis-sekar-jagad', 'Motif Sekar Jagad melambangkan keberagaman dan keindahan dunia, dibuat dengan pewarna alami.', 950000, 5, 'batik-sekarjagad.jpg', 'Sekar Jagad', 'Katun Primisima'),
(2, 'Batik Cap Motif Kawung', 'batik-cap-kawung', 'Batik cap motif Kawung dengan warna sogan klasik, cocok untuk acara formal maupun sehari-hari.', 275000, 20, 'batik-kawung.jpg', 'Kawung', 'Katun Prima'),
(2, 'Batik Cap Motif Mega Mendung', 'batik-cap-mega-mendung', 'Motif Mega Mendung khas Cirebon dengan gradasi warna biru yang khas.', 295000, 15, 'batik-megamendung.jpg', 'Mega Mendung', 'Katun Prima'),
(3, 'Kemeja Batik Lengan Panjang Pria', 'kemeja-batik-pria-panjang', 'Kemeja batik lengan panjang untuk pria, motif kombinasi modern, nyaman dipakai kerja maupun acara resmi.', 320000, 25, 'kemeja-pria-panjang.jpg', 'Kombinasi Modern', 'Katun Batik'),
(3, 'Kemeja Batik Lengan Pendek Wanita', 'kemeja-batik-wanita-pendek', 'Kemeja batik wanita lengan pendek dengan potongan slimfit, cocok untuk gaya kasual maupun formal.', 275000, 30, 'kemeja-wanita-pendek.jpg', 'Kombinasi Modern', 'Katun Batik'),
(4, 'Selendang Batik Tulis', 'selendang-batik-tulis', 'Selendang batik tulis dengan motif floral, lembut dan ringan, cocok sebagai pelengkap busana.', 185000, 18, 'selendang-batik.jpg', 'Floral', 'Sutra Katun'),
(4, 'Totebag Kain Batik', 'totebag-kain-batik', 'Totebag kanvas berlapis kain batik, kuat dan stylish untuk kebutuhan harian.', 95000, 40, 'totebag-batik.jpg', 'Kombinasi', 'Kanvas + Batik')
ON DUPLICATE KEY UPDATE
  kategori_id = VALUES(kategori_id),
  deskripsi = VALUES(deskripsi),
  harga = VALUES(harga),
  stok = VALUES(stok),
  gambar = VALUES(gambar),
  motif = VALUES(motif),
  bahan = VALUES(bahan);

-- =========================================================
-- Catatan: file ini sudah mencakup migrasi bukti pembayaran.
-- Jadi untuk database baru, cukup import file ini saja.
-- =========================================================
