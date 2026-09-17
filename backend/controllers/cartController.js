const pool = require('../config/db');

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function ringkasKeranjang(cart) {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

// GET /api/keranjang
async function lihatKeranjang(req, res) {
  try {
    const cart = getCart(req);
    const ids = Object.keys(cart);
    let items = [];
    let total = 0;

    if (ids.length > 0) {
      const [produk] = await pool.query(
        `SELECT * FROM produk WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      items = produk.map((p) => {
        const jumlah = cart[p.id];
        const subtotal = Number(p.harga) * jumlah;
        total += subtotal;
        return { ...p, jumlah, subtotal };
      });
    }

    res.json({ success: true, items, total, jumlahItem: ringkasKeranjang(cart) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memuat keranjang.' });
  }
}

// POST /api/keranjang/tambah
async function tambahKeranjang(req, res) {
  try {
    const { produk_id, jumlah } = req.body;
    const qty = Math.max(1, parseInt(jumlah, 10) || 1);

    const [rows] = await pool.query('SELECT stok FROM produk WHERE id = ?', [produk_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const cart = getCart(req);
    const jumlahSaatIni = cart[produk_id] || 0;
    const jumlahBaru = jumlahSaatIni + qty;

    if (jumlahBaru > rows[0].stok) {
      return res.status(422).json({ success: false, message: `Stok tidak cukup. Sisa stok: ${rows[0].stok}.` });
    }

    cart[produk_id] = jumlahBaru;
    res.json({ success: true, message: 'Produk ditambahkan ke keranjang.', jumlahItem: ringkasKeranjang(cart) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan produk ke keranjang.' });
  }
}

// POST /api/keranjang/update
function updateKeranjang(req, res) {
  const { produk_id, jumlah } = req.body;
  const cart = getCart(req);
  const qty = parseInt(jumlah, 10);

  if (!cart[produk_id]) {
    return res.status(404).json({ success: false, message: 'Produk tidak ada di keranjang.' });
  }
  if (qty <= 0) {
    delete cart[produk_id];
  } else {
    cart[produk_id] = qty;
  }
  res.json({ success: true, jumlahItem: ringkasKeranjang(cart) });
}

// POST /api/keranjang/hapus
function hapusDariKeranjang(req, res) {
  const { produk_id } = req.body;
  const cart = getCart(req);
  delete cart[produk_id];
  res.json({ success: true, message: 'Produk dihapus dari keranjang.', jumlahItem: ringkasKeranjang(cart) });
}

module.exports = { lihatKeranjang, tambahKeranjang, updateKeranjang, hapusDariKeranjang, getCart };
