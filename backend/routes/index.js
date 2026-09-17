const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const shop = require('../controllers/shopController');
const cart = require('../controllers/cartController');
const checkout = require('../controllers/checkoutController');
const upload = require('../middleware/upload');

router.get('/', shop.beranda);
router.get('/katalog', shop.katalog);
router.get('/produk/:slug', shop.detailProduk);

router.get('/keranjang', cart.lihatKeranjang);
router.post('/keranjang/tambah', cart.tambahKeranjang);
router.post('/keranjang/update', cart.updateKeranjang);
router.post('/keranjang/hapus', cart.hapusDariKeranjang);

router.get('/pembayaran', checkout.infoPembayaran);

router.get('/checkout', checkout.formCheckout);
router.post(
  '/checkout',
  [
    body('nama').trim().notEmpty().withMessage('Nama lengkap wajib diisi.'),
    body('email').trim().isEmail().withMessage('Format email tidak valid.'),
    body('no_hp')
      .trim()
      .matches(/^[0-9+\s-]{9,15}$/)
      .withMessage('Nomor HP tidak valid (9-15 digit).'),
    body('alamat').trim().isLength({ min: 10 }).withMessage('Alamat lengkap minimal 10 karakter.')
  ],
  checkout.prosesCheckout
);
router.get('/checkout/sukses/:kode', checkout.halamanSukses);

// Upload foto bukti pembayaran (transfer bank / e-wallet QRIS)
router.post('/checkout/:kode/bukti', upload.single('bukti'), checkout.uploadBuktiTransfer);

module.exports = router;
