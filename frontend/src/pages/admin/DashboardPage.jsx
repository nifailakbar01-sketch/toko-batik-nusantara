import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../../utils/format';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading && <p>Memuat...</p>}
      {!loading && data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="num">{data.totalProduk}</div>
              <div className="label">Total Produk</div>
            </div>
            <div className="stat-card">
              <div className="num">{data.totalKategori}</div>
              <div className="label">Total Kategori</div>
            </div>
            <div className="stat-card">
              <div className="num">{data.totalTransaksi}</div>
              <div className="label">Total Transaksi</div>
            </div>
            <div className="stat-card">
              <div className="num">{formatRupiah(data.totalPendapatan)}</div>
              <div className="label">Total Pendapatan</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Transaksi Terbaru</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pembeli</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.transaksiTerbaru.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/admin/transaksi/${t.id}`}>{t.kode_transaksi}</Link>
                    </td>
                    <td>{t.nama_pembeli}</td>
                    <td>{formatRupiah(t.total_harga)}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                    </td>
                    <td>{formatTanggal(t.created_at)}</td>
                  </tr>
                ))}
                {data.transaksiTerbaru.length === 0 && (
                  <tr>
                    <td colSpan={5}>Belum ada transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Stok Menipis</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Stok</th>
                </tr>
              </thead>
              <tbody>
                {data.produkStokMenipis.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nama_produk}</td>
                    <td className="stok-menipis">{p.stok}</td>
                  </tr>
                ))}
                {data.produkStokMenipis.length === 0 && (
                  <tr>
                    <td colSpan={2}>Semua stok produk aman.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
