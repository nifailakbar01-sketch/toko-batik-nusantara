import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatRupiah } from '../utils/format';
import { useCart } from '../context/CartContext';
import { usePelangganAuth } from '../context/PelangganAuthContext';
import PanelPembayaran from '../components/PanelPembayaran';

const initialForm = { nama: '', email: '', no_hp: '', alamat: '', metode_pembayaran: 'transfer_bank' };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refreshJumlah } = useCart();
  const { pelanggan } = usePelangganAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [metode, setMetode] = useState([]);
  const [pembayaran, setPembayaran] = useState({});
  const [loading, setLoading] = useState(true);
  const [kosong, setKosong] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorUmum, setErrorUmum] = useState('');

  useEffect(() => {
    api
      .get('/checkout')
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setMetode(data.metode || []);
        setPembayaran(data.pembayaran || {});
      })
      .catch(() => setKosong(true))
      .finally(() => setLoading(false));
  }, []);

  // Isi otomatis data diri dari akun pelanggan yang sedang login
  useEffect(() => {
    if (pelanggan) {
      setForm((f) => ({
        ...f,
        nama: f.nama || pelanggan.nama_lengkap || '',
        email: f.email || pelanggan.email || '',
        no_hp: f.no_hp || pelanggan.no_hp || '',
        alamat: f.alamat || pelanggan.alamat || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pelanggan]);

  function pesanError(field) {
    const e = errors.find((er) => er.path === field || er.param === field);
    return e ? e.msg : null;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    setErrorUmum('');
    try {
      const data = await api.post('/checkout', form);
      await refreshJumlah();
      navigate(`/checkout/sukses/${data.kodeTransaksi}`);
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      } else {
        setErrorUmum(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p>Memuat...</p></div>;

  if (kosong || items.length === 0) {
    return (
      <div className="container">
        <p>
          Keranjang belanja Anda masih kosong. <Link to="/katalog">Mulai belanja</Link>
        </p>
      </div>
    );
  }

  const infoTerpilih = pembayaran[form.metode_pembayaran];

  return (
    <div className="container">
      <div className="checkout-grid">
        <div>
          <h1>Checkout</h1>
          {!pelanggan && (
            <p className="hint">
              Belanja sebagai tamu, atau <Link to="/login" state={{ dari: '/checkout' }}>masuk</Link> agar
              pesanan tersimpan di riwayat akun Anda.
            </p>
          )}
          {errorUmum && <div className="flash flash-error">{errorUmum}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
              {pesanError('nama') && <div className="form-error">{pesanError('nama')}</div>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {pesanError('email') && <div className="form-error">{pesanError('email')}</div>}
            </div>
            <div className="form-group">
              <label>Nomor HP</label>
              <input
                type="text"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />
              {pesanError('no_hp') && <div className="form-error">{pesanError('no_hp')}</div>}
            </div>
            <div className="form-group">
              <label>Alamat Lengkap</label>
              <textarea
                rows={4}
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
              {pesanError('alamat') && <div className="form-error">{pesanError('alamat')}</div>}
            </div>

            <div className="form-group">
              <label>Metode Pembayaran</label>
              <select
                value={form.metode_pembayaran}
                onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}
              >
                {metode.map((m) => (
                  <option key={m.kode} value={m.kode}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Panel dinamis: rekening bank / QRIS / info COD */}
            <PanelPembayaran info={infoTerpilih} total={total} />

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>Ringkasan Pesanan</h3>
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <span>
                {item.nama_produk} x{item.jumlah}
              </span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
          <div className="item-row cart-total-row">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
