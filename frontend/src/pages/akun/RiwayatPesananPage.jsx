import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../../utils/format';

export default function RiwayatPesananPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorUmum, setErrorUmum] = useState('');

  useEffect(() => {
    api
      .get('/pelanggan/pesanan')
      .then((data) => setTransaksi(data.transaksi || []))
      .catch((err) => setErrorUmum(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>Riwayat Pesanan Saya</h1>
      <p>
        <Link to="/akun">&larr; Kembali ke Akun Saya</Link>
      </p>

      {loading && <p>Memuat...</p>}
      {errorUmum && <div className="flash flash-error">{errorUmum}</div>}

      {!loading && transaksi.length === 0 && (
        <p>
          Anda belum memiliki pesanan. <Link to="/katalog">Mulai belanja</Link>
        </p>
      )}

      {transaksi.length > 0 && (
        <table className="cart-table" style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th>Kode Pesanan</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t) => (
              <tr key={t.id}>
                <td>{t.kode_transaksi}</td>
                <td>{formatTanggal(t.created_at)}</td>
                <td>{formatRupiah(t.total_harga)}</td>
                <td>{STATUS_LABEL[t.status] || t.status}</td>
                <td>
                  <Link to={`/checkout/sukses/${t.kode_transaksi}`} className="btn btn-secondary btn-sm">
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
