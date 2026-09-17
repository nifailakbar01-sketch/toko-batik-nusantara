const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

function toSesi(row) {
  return {
    id: row.id,
    nama_lengkap: row.nama_lengkap,
    email: row.email,
    no_hp: row.no_hp,
    alamat: row.alamat
  };
}

// GET /api/pelanggan/me
function me(req, res) {
  if (!req.session.pelanggan) {
    return res.status(401).json({ success: false, message: 'Belum login.' });
  }
  res.json({ success: true, pelanggan: req.session.pelanggan });
}

// POST /api/pelanggan/register
async function prosesRegister(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { nama_lengkap, email, password, no_hp, alamat } = req.body;

    const [existing] = await pool.query('SELECT id FROM pelanggan WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(422).json({
        success: false,
        errors: [{ path: 'email', msg: 'Email sudah terdaftar. Silakan login.' }]
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const [hasil] = await pool.query(
      `INSERT INTO pelanggan (nama_lengkap, email, password, no_hp, alamat) VALUES (?, ?, ?, ?, ?)`,
      [nama_lengkap, email, hash, no_hp || null, alamat || null]
    );

    const [rows] = await pool.query('SELECT * FROM pelanggan WHERE id = ?', [hasil.insertId]);
    req.session.pelanggan = toSesi(rows[0]);
    res.json({ success: true, pelanggan: req.session.pelanggan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan akun.' });
  }
}

// POST /api/pelanggan/login
async function prosesLogin(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM pelanggan WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const cocok = await bcrypt.compare(password, rows[0].password);
    if (!cocok) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    req.session.pelanggan = toSesi(rows[0]);
    res.json({ success: true, pelanggan: req.session.pelanggan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login.' });
  }
}

// POST /api/pelanggan/logout
function logout(req, res) {
  req.session.pelanggan = null;
  res.json({ success: true, message: 'Berhasil logout.' });
}

// POST /api/pelanggan/profil
async function updateProfil(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const id = req.session.pelanggan.id;
    const { nama_lengkap, no_hp, alamat } = req.body;

    await pool.query(
      `UPDATE pelanggan SET nama_lengkap = ?, no_hp = ?, alamat = ? WHERE id = ?`,
      [nama_lengkap, no_hp || null, alamat || null, id]
    );

    const [rows] = await pool.query('SELECT * FROM pelanggan WHERE id = ?', [id]);
    req.session.pelanggan = toSesi(rows[0]);
    res.json({ success: true, pelanggan: req.session.pelanggan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
}

// GET /api/pelanggan/pesanan
async function riwayatPesanan(req, res) {
  try {
    const id = req.session.pelanggan.id;
    const [rows] = await pool.query(
      'SELECT * FROM transaksi WHERE pelanggan_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json({ success: true, transaksi: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat riwayat pesanan.' });
  }
}

// GET /api/pelanggan/pesanan/:kode
async function detailPesanan(req, res) {
  try {
    const id = req.session.pelanggan.id;
    const { kode } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM transaksi WHERE kode_transaksi = ? AND pelanggan_id = ?',
      [kode, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }
    const transaksi = rows[0];
    const [detail] = await pool.query('SELECT * FROM transaksi_detail WHERE transaksi_id = ?', [transaksi.id]);

    res.json({ success: true, transaksi, detail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat detail pesanan.' });
  }
}

module.exports = { me, prosesRegister, prosesLogin, logout, updateProfil, riwayatPesanan, detailPesanan };
