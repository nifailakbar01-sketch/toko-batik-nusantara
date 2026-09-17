const pool = require('../config/db');

// GET /api/
async function beranda(req, res) {
  try {
    const [kategori] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
    const [produkUnggulan] = await pool.query(
      `SELECT p.*, k.nama_kategori FROM produk p
       JOIN kategori k ON p.kategori_id = k.id
       WHERE p.is_active = 1
       ORDER BY p.created_at DESC LIMIT 6`
    );
    res.json({ success: true, kategori, produkUnggulan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat beranda.' });
  }
}

// GET /api/katalog
async function katalog(req, res) {
  try {
    const { kategori: kategoriSlug, q } = req.query;
    const [semuaKategori] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');

    let sql = `SELECT p.*, k.nama_kategori, k.slug AS kategori_slug FROM produk p
               JOIN kategori k ON p.kategori_id = k.id
               WHERE p.is_active = 1`;
    const params = [];

    if (kategoriSlug) {
      sql += ' AND k.slug = ?';
      params.push(kategoriSlug);
    }
    if (q) {
      sql += ' AND (p.nama_produk LIKE ? OR p.motif LIKE ? OR p.deskripsi LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY p.created_at DESC';

    const [produk] = await pool.query(sql, params);

    res.json({
      success: true,
      produk,
      semuaKategori,
      kategoriAktif: kategoriSlug || '',
      keyword: q || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat katalog.' });
  }
}

// GET /api/produk/:slug
async function detailProduk(req, res) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, k.nama_kategori, k.slug AS kategori_slug FROM produk p
       JOIN kategori k ON p.kategori_id = k.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    const produk = rows[0];
    const [terkait] = await pool.query(
      `SELECT * FROM produk WHERE kategori_id = ? AND id != ? AND is_active = 1 LIMIT 4`,
      [produk.kategori_id, produk.id]
    );
    res.json({ success: true, produk, terkait });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat detail produk.' });
  }
}

module.exports = { beranda, katalog, detailProduk };
