const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const admin = require('../controllers/adminController');
const produkCtrl = require('../controllers/adminProdukController');
const kategoriCtrl = require('../controllers/adminKategoriController');
const transaksiCtrl = require('../controllers/adminTransaksiController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const validasiProduk = [
  body('nama_produk').trim().notEmpty().withMessage('Nama produk wajib diisi.'),
  body('kategori_id').notEmpty().withMessage('Kategori wajib dipilih.'),
  body('harga').isFloat({ min: 0 }).withMessage('Harga harus berupa angka positif.'),
  body('stok').isInt({ min: 0 }).withMessage('Stok harus berupa bilangan bulat >= 0.')
];

// Auth
router.get('/me', admin.me);
router.post('/login', admin.prosesLogin);
router.post('/logout', admin.logout);

// Dashboard
router.get('/dashboard', requireAdmin, admin.dashboard);

// CRUD Produk
router.get('/produk', requireAdmin, produkCtrl.daftarProduk);
router.get('/produk/:id', requireAdmin, produkCtrl.detailProduk);
router.post('/produk/tambah', requireAdmin, upload.single('gambar'), validasiProduk, produkCtrl.prosesTambah);
router.post('/produk/edit/:id', requireAdmin, upload.single('gambar'), validasiProduk, produkCtrl.prosesEdit);
router.post('/produk/hapus/:id', requireAdmin, produkCtrl.hapusProduk);

// CRUD Kategori
router.get('/kategori', requireAdmin, kategoriCtrl.daftarKategori);
router.post('/kategori/tambah', requireAdmin, kategoriCtrl.tambahKategori);
router.post('/kategori/edit/:id', requireAdmin, kategoriCtrl.editKategori);
router.post('/kategori/hapus/:id', requireAdmin, kategoriCtrl.hapusKategori);

// Transaksi
router.get('/transaksi', requireAdmin, transaksiCtrl.daftarTransaksi);
router.get('/transaksi/:id', requireAdmin, transaksiCtrl.detailTransaksi);
router.post('/transaksi/:id/status', requireAdmin, transaksiCtrl.updateStatus);

// Laporan Penjualan
router.get('/laporan', requireAdmin, transaksiCtrl.laporanPenjualan);

module.exports = router;
