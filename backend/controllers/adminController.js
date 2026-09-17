const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/admin/me
function me(req, res) {
  if (!req.session.admin) {
    return res.status(401).json({ success: false, message: 'Belum login.' });
  }
  res.json({ success: true, admin: req.session.admin });
}

// POST /api/admin/login
async function prosesLogin(req, res) {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const cocok = await bcrypt.compare(password, rows[0].password);
    if (!cocok) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    req.session.admin = { id: rows[0].id, username: rows[0].username, nama_lengkap: rows[0].nama_lengkap };
    res.json({ success: true, admin: req.session.admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login.' });
  }
}

// POST /api/admin/logout
function logout(req, res) {
  req.session.admin = null;
  res.json({ success: true, message: 'Berhasil logout.' });
}

// GET /api/admin/dashboard
async function dashboard(req, res) {
  try {
    const [[{ totalProduk }]] = await pool.query('SELECT COUNT(*) AS totalProduk FROM produk');
    const [[{ totalKategori }]] = await pool.query('SELECT COUNT(*) AS totalKategori FROM kategori');
    const [[{ totalTransaksi }]] = await pool.query('SELECT COUNT(*) AS totalTransaksi FROM transaksi');
    const [[{ totalPendapatan }]] = await pool.query(
      `SELECT COALESCE(SUM(total_harga),0) AS totalPendapatan FROM transaksi WHERE status != 'dibatalkan'`
    );
    const [transaksiTerbaru] = await pool.query(
      'SELECT * FROM transaksi ORDER BY created_at DESC LIMIT 5'
    );
    const [produkStokMenipis] = await pool.query(
      'SELECT * FROM produk WHERE stok <= 5 ORDER BY stok ASC LIMIT 5'
    );

    res.json({
      success: true,
      totalProduk,
      totalKategori,
      totalTransaksi,
      totalPendapatan,
      transaksiTerbaru,
      produkStokMenipis
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat dashboard.' });
  }
}

module.exports = { me, prosesLogin, logout, dashboard };
