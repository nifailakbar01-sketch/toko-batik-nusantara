const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

function buatSlug(teks) {
  return teks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-5);
}

// GET /api/admin/produk
async function daftarProduk(req, res) {
  const [produk] = await pool.query(
    `SELECT p.*, k.nama_kategori FROM produk p
     JOIN kategori k ON p.kategori_id = k.id
     ORDER BY p.created_at DESC`
  );
  res.json({ success: true, produk });
}

// GET /api/admin/produk/:id
async function detailProduk(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM produk WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
  }
  res.json({ success: true, produk: rows[0] });
}

// POST /api/admin/produk/tambah
async function prosesTambah(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { nama_produk, kategori_id, deskripsi, harga, stok, motif, bahan } = req.body;
    const slug = buatSlug(nama_produk);
    const gambar = req.file ? req.file.filename : 'default-produk.jpg';

    const [hasil] = await pool.query(
      `INSERT INTO produk (kategori_id, nama_produk, slug, deskripsi, harga, stok, gambar, motif, bahan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kategori_id, nama_produk, slug, deskripsi, harga, stok, gambar, motif, bahan]
    );
    res.json({ success: true, message: 'Produk berhasil ditambahkan.', id: hasil.insertId });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal menambahkan produk.' });
  }
}

// POST /api/admin/produk/edit/:id
async function prosesEdit(req, res) {
  const { id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { nama_produk, kategori_id, deskripsi, harga, stok, motif, bahan, is_active } = req.body;
    const [existing] = await pool.query('SELECT gambar FROM produk WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    let gambar = existing[0].gambar;
    if (req.file) {
      gambar = req.file.filename;
      const gambarLama = path.join(__dirname, '..', 'public', 'uploads', existing[0].gambar);
      if (existing[0].gambar !== 'default-produk.jpg' && fs.existsSync(gambarLama)) {
        fs.unlinkSync(gambarLama);
      }
    }

    await pool.query(
      `UPDATE produk SET kategori_id=?, nama_produk=?, deskripsi=?, harga=?, stok=?, gambar=?, motif=?, bahan=?, is_active=?
       WHERE id=?`,
      [kategori_id, nama_produk, deskripsi, harga, stok, gambar, motif, bahan, is_active ? 1 : 0, id]
    );
    res.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal memperbarui produk.' });
  }
}

// POST /api/admin/produk/hapus/:id
async function hapusProduk(req, res) {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT gambar FROM produk WHERE id = ?', [id]);
    await pool.query('DELETE FROM produk WHERE id = ?', [id]);
    if (existing.length && existing[0].gambar !== 'default-produk.jpg') {
      const filePath = path.join(__dirname, '..', 'public', 'uploads', existing[0].gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal menghapus produk. Pastikan produk tidak terkait transaksi.' });
  }
}

module.exports = { daftarProduk, detailProduk, prosesTambah, prosesEdit, hapusProduk };
