-- =========================================================
-- Migrasi: Tambah role Pelanggan (akun pembeli)
-- Jalankan file ini setelah schema.sql / migration-bukti-pembayaran.sql
-- =========================================================
USE toko_batik_nusantara;

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
-- Tautkan transaksi ke akun pelanggan (opsional, tetap
-- mendukung checkout sebagai tamu / guest checkout)
-- ---------------------------------------------------------
ALTER TABLE transaksi
  ADD COLUMN IF NOT EXISTS pelanggan_id INT DEFAULT NULL AFTER id,
  ADD CONSTRAINT fk_transaksi_pelanggan
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL;
