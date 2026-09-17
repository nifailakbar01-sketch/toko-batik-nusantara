const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { getCart } = require('./cartController');
const { METODE_PEMBAYARAN, daftarMetode, getMetode, butuhBukti } = require('../config/pembayaran');

async function ambilItemKeranjang(cart) {
  const ids = Object.keys(cart);
  if (ids.length === 0) return { items: [], total: 0 };

  const [produk] = await pool.query(
    `SELECT * FROM produk WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids
  );
  let total = 0;
  const items = produk.map((p) => {
    const jumlah = cart[p.id];
    const subtotal = Number(p.harga) * jumlah;
    total += subtotal;
    return { ...p, jumlah, subtotal };
  });
  return { items, total };
}

// GET /api/pembayaran
// Daftar metode pembayaran + detailnya (nomor rekening / QRIS)
async function infoPembayaran(req, res) {
  res.json({ success: true, metode: daftarMetode(), detail: METODE_PEMBAYARAN });
}

// GET /api/checkout
async function formCheckout(req, res) {
  const cart = getCart(req);
  const { items, total } = await ambilItemKeranjang(cart);
  if (items.length === 0) {
    return res.status(400).json({ success: false, message: 'Keranjang belanja Anda masih kosong.' });
  }
  res.json({
    success: true,
    items,
    total,
    metode: daftarMetode(),
    pembayaran: METODE_PEMBAYARAN
  });
}

// POST /api/checkout
async function prosesCheckout(req, res) {
  const cart = getCart(req);
  const errors = validationResult(req);
  const { items, total } = await ambilItemKeranjang(cart);

  if (items.length === 0) {
    return res.status(400).json({ success: false, message: 'Keranjang belanja Anda masih kosong.' });
  }

  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array(), items, total });
  }

  const metodeDipilih = req.body.metode_pembayaran || 'transfer_bank';
  if (!getMetode(metodeDipilih)) {
    return res.status(422).json({ success: false, message: 'Metode pembayaran tidak dikenal.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Cek ulang stok sebelum menyimpan transaksi (mencegah overselling)
    for (const item of items) {
      const [[stokTerkini]] = await connection.query('SELECT stok FROM produk WHERE id = ? FOR UPDATE', [item.id]);
      if (!stokTerkini || stokTerkini.stok < item.jumlah) {
        throw new Error(`Stok "${item.nama_produk}" tidak mencukupi.`);
      }
    }

    const kodeTransaksi = 'TRX-' + Date.now();
    const { nama, email, no_hp, alamat } = req.body;
    // Bila pembeli sedang login sebagai pelanggan, tautkan pesanan ke akunnya
    // (checkout tanpa login/sebagai tamu tetap didukung, pelanggan_id akan NULL)
    const pelangganId = req.session.pelanggan ? req.session.pelanggan.id : null;

    const [hasil] = await connection.query(
      `INSERT INTO transaksi (pelanggan_id, kode_transaksi, nama_pembeli, email, no_hp, alamat, total_harga, metode_pembayaran)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pelangganId, kodeTransaksi, nama, email, no_hp, alamat, total, metodeDipilih]
    );
    const transaksiId = hasil.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO transaksi_detail (transaksi_id, produk_id, nama_produk, harga_satuan, jumlah, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transaksiId, item.id, item.nama_produk, item.harga, item.jumlah, item.subtotal]
      );
      await connection.query('UPDATE produk SET stok = stok - ? WHERE id = ?', [item.jumlah, item.id]);
    }

    await connection.commit();
    req.session.cart = {};
    res.json({
      success: true,
      message: 'Pesanan berhasil dibuat.',
      kodeTransaksi,
      butuhBukti: butuhBukti(metodeDipilih)
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(422).json({ success: false, message: err.message || 'Gagal memproses pesanan.' });
  } finally {
    connection.release();
  }
}

// GET /api/checkout/sukses/:kode
async function halamanSukses(req, res) {
  const { kode } = req.params;
  const [rows] = await pool.query('SELECT * FROM transaksi WHERE kode_transaksi = ?', [kode]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
  }
  const transaksi = rows[0];
  const [detail] = await pool.query('SELECT * FROM transaksi_detail WHERE transaksi_id = ?', [transaksi.id]);

  res.json({
    success: true,
    transaksi,
    detail,
    pembayaran: getMetode(transaksi.metode_pembayaran),
    butuhBukti: butuhBukti(transaksi.metode_pembayaran)
  });
}

// POST /api/checkout/:kode/bukti  (multipart/form-data, field: bukti)
async function uploadBuktiTransfer(req, res) {
  const { kode } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM transaksi WHERE kode_transaksi = ?', [kode]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }
    const transaksi = rows[0];

    if (!butuhBukti(transaksi.metode_pembayaran)) {
      return res.status(422).json({
        success: false,
        message: 'Pesanan COD tidak memerlukan bukti pembayaran.'
      });
    }

    if (!req.file) {
      return res.status(422).json({
        success: false,
        message: 'Foto bukti pembayaran wajib diunggah (jpg, jpeg, png, atau webp, maks 2MB).'
      });
    }

    // Hapus bukti lama bila pembeli mengunggah ulang
    if (transaksi.bukti_transfer) {
      const lama = path.join(__dirname, '..', 'public', 'uploads', transaksi.bukti_transfer);
      fs.unlink(lama, () => {});
    }

    const statusBaru =
      transaksi.status === 'menunggu_pembayaran' ? 'menunggu_konfirmasi' : transaksi.status;

    await pool.query(
      `UPDATE transaksi
       SET bukti_transfer = ?, tanggal_bukti = NOW(), catatan_pembayaran = ?, status = ?
       WHERE id = ?`,
      [req.file.filename, req.body.catatan || null, statusBaru, transaksi.id]
    );

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil dikirim. Pesanan Anda menunggu konfirmasi admin.',
      bukti_transfer: req.file.filename,
      status: statusBaru
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan bukti pembayaran.' });
  }
}

module.exports = {
  formCheckout,
  prosesCheckout,
  halamanSukses,
  infoPembayaran,
  uploadBuktiTransfer
};
