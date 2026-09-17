const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const pelanggan = require('../controllers/pelangganController');
const { requirePelanggan } = require('../middleware/auth');

const validasiRegister = [
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi.'),
  body('email').trim().isEmail().withMessage('Format email tidak valid.'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
  body('no_hp')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{9,15}$/)
    .withMessage('Nomor HP tidak valid (9-15 digit).')
];

const validasiProfil = [
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi.'),
  body('no_hp')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{9,15}$/)
    .withMessage('Nomor HP tidak valid (9-15 digit).')
];

// Auth pelanggan
router.get('/me', pelanggan.me);
router.post('/register', validasiRegister, pelanggan.prosesRegister);
router.post('/login', pelanggan.prosesLogin);
router.post('/logout', pelanggan.logout);

// Profil & riwayat pesanan (butuh login)
router.post('/profil', requirePelanggan, validasiProfil, pelanggan.updateProfil);
router.get('/pesanan', requirePelanggan, pelanggan.riwayatPesanan);
router.get('/pesanan/:kode', requirePelanggan, pelanggan.detailPesanan);

module.exports = router;
