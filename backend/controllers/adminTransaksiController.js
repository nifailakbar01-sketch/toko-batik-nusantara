const pool = require('../config/db');

// GET /api/admin/transaksi
async function daftarTransaksi(req, res) {
  const { status } = req.query;
  let sql = 'SELECT * FROM transaksi';
  const params = [];
  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  const [transaksi] = await pool.query(sql, params);
  res.json({ success: true, transaksi, statusAktif: status || '' });
}

// GET /api/admin/transaksi/:id
async function detailTransaksi(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM transaksi WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
  }
  const [detail] = await pool.query('SELECT * FROM transaksi_detail WHERE transaksi_id = ?', [id]);
  res.json({ success: true, transaksi: rows[0], detail });
}

// POST /api/admin/transaksi/:id/status
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const statusValid = [
    'menunggu_pembayaran',
    'menunggu_konfirmasi',
    'diproses',
    'dikirim',
    'selesai',
    'dibatalkan'
  ];
  if (!statusValid.includes(status)) {
    return res.status(422).json({ success: false, message: 'Status tidak valid.' });
  }
  await pool.query('UPDATE transaksi SET status = ? WHERE id = ?', [status, id]);
  res.json({ success: true, message: 'Status transaksi berhasil diperbarui.' });
}

// GET /api/admin/laporan
async function laporanPenjualan(req, res) {
  const { dari, sampai } = req.query;
  let sql = `SELECT * FROM transaksi WHERE status != 'dibatalkan'`;
  const params = [];

  if (dari) {
    sql += ' AND DATE(created_at) >= ?';
    params.push(dari);
  }
  if (sampai) {
    sql += ' AND DATE(created_at) <= ?';
    params.push(sampai);
  }
  sql += ' ORDER BY created_at DESC';

  const [transaksi] = await pool.query(sql, params);
  const totalPendapatan = transaksi.reduce((sum, t) => sum + Number(t.total_harga), 0);

  const [produkTerlaris] = await pool.query(
    `SELECT nama_produk, SUM(jumlah) AS total_terjual FROM transaksi_detail
     GROUP BY nama_produk ORDER BY total_terjual DESC LIMIT 5`
  );

  res.json({
    success: true,
    transaksi,
    totalPendapatan,
    produkTerlaris,
    dari: dari || '',
    sampai: sampai || ''
  });
}

module.exports = { daftarTransaksi, detailTransaksi, updateStatus, laporanPenjualan };
