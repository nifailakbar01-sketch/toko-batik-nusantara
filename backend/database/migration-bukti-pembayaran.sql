-- =========================================================
-- Migrasi: Fitur Bukti Pembayaran (Transfer Bank & E-Wallet QRIS)
-- Jalankan HANYA jika database sudah terlanjur dibuat dengan schema lama.
-- Kalau Anda membuat database baru dari schema.sql, file ini tidak perlu dijalankan.
--
-- Cara pakai:  mysql -u root -p toko_batik_nusantara < database/migration-bukti-pembayaran.sql
-- =========================================================

USE toko_batik_nusantara;

-- 1) Kolom penyimpan foto bukti pembayaran
ALTER TABLE transaksi
  ADD COLUMN bukti_transfer VARCHAR(255) DEFAULT NULL AFTER metode_pembayaran,
  ADD COLUMN tanggal_bukti DATETIME DEFAULT NULL AFTER bukti_transfer,
  ADD COLUMN catatan_pembayaran VARCHAR(255) DEFAULT NULL AFTER tanggal_bukti;

-- 2) Tambah status baru 'menunggu_konfirmasi' (setelah pembeli mengunggah bukti)
ALTER TABLE transaksi
  MODIFY COLUMN status ENUM(
    'menunggu_pembayaran',
    'menunggu_konfirmasi',
    'diproses',
    'dikirim',
    'selesai',
    'dibatalkan'
  ) DEFAULT 'menunggu_pembayaran';
