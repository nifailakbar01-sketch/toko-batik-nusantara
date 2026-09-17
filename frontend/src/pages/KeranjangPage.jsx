import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, urlGambar } from '../api/client';
import { formatRupiah } from '../utils/format';
import { useCart } from '../context/CartContext';
import Flash from '../components/Flash';

export default function KeranjangPage() {
  const { refreshJumlah } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);

  async function muat() {
    setLoading(true);
    try {
      const data = await api.get('/keranjang');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setPesan({ type: 'error', message: 'Gagal memuat keranjang.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ubahJumlah(produk_id, jumlahBaru) {
    try {
      await api.post('/keranjang/update', { produk_id, jumlah: jumlahBaru });
      await muat();
      await refreshJumlah();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  async function hapus(produk_id) {
    try {
      const data = await api.post('/keranjang/hapus', { produk_id });
      setPesan({ type: 'success', message: data.message });
      await muat();
      await refreshJumlah();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  return (
    <div className="container">
      <section className="block">
        <h1>Keranjang Belanja</h1>
        <Flash type={pesan?.type} message={pesan?.message} />

        {loading && <p>Memuat...</p>}

        {!loading && items.length === 0 && (
          <p>
            Keranjang belanja Anda masih kosong. <Link to="/katalog">Mulai belanja</Link>
          </p>
        )}

        {!loading && items.length > 0 && (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.gambar && item.gambar !== 'default-produk.jpg' && (
                        <img
                          src={urlGambar(item.gambar)}
                          alt={item.nama_produk}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                      {item.nama_produk}
                    </td>
                    <td>{formatRupiah(item.harga)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={item.stok}
                        value={item.jumlah}
                        style={{ width: 70, padding: 6 }}
                        onChange={(e) => ubahJumlah(item.id, parseInt(e.target.value, 10) || 0)}
                      />
                    </td>
                    <td>{formatRupiah(item.subtotal)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => hapus(item.id)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="cart-total-row">
                    Total
                  </td>
                  <td colSpan={2} className="cart-total-row">
                    {formatRupiah(total)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="cart-actions">
              <Link to="/katalog" className="btn btn-secondary">
                Lanjut Belanja
              </Link>
              <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
                Lanjut ke Checkout
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
