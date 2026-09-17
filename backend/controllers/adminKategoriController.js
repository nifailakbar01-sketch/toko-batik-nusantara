const pool = require('../config/db');

function buatSlug(teks) {
  return teks.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/admin/kategori
async function daftarKategori(req, res) {
  const [kategori] = await pool.query(
    `SELECT k.*, COUNT(p.id) AS jumlah_produk FROM kategori k
     LEFT JOIN produk p ON p.kategori_id = k.id
     GROUP BY k.id ORDER BY k.nama_kategori ASC`
  );
  res.json({ success: true, kategori });
}

// POST /api/admin/kategori/tambah
async function tambahKategori(req, res) {
  const { nama_kategori, deskripsi } = req.body;
  if (!nama_kategori || nama_kategori.trim() === '') {
    return res.status(422).json({ success: false, message: 'Nama kategori wajib diisi.' });
  }
  try {
    await pool.query(
      'INSERT INTO kategori (nama_kategori, slug, deskripsi) VALUES (?, ?, ?)',
      [nama_kategori, buatSlug(nama_kategori), deskripsi || null]
    );
    res.json({ success: true, message: 'Kategori berhasil ditambahkan.' });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal menambahkan kategori (mungkin nama sudah dipakai).' });
  }
}

// POST /api/admin/kategori/edit/:id
async function editKategori(req, res) {
  const { id } = req.params;
  const { nama_kategori, deskripsi } = req.body;
  try {
    await pool.query(
      'UPDATE kategori SET nama_kategori=?, slug=?, deskripsi=? WHERE id=?',
      [nama_kategori, buatSlug(nama_kategori), deskripsi || null, id]
    );
    res.json({ success: true, message: 'Kategori berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal memperbarui kategori.' });
  }
}

// POST /api/admin/kategori/hapus/:id
async function hapusKategori(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kategori WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(422).json({ success: false, message: 'Gagal menghapus kategori. Pastikan tidak ada produk yang memakai kategori ini.' });
  }
}

module.exports = { daftarKategori, tambahKategori, editKategori, hapusKategori };
