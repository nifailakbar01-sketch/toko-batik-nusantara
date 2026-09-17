import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../../utils/format';

export default function LaporanPage() {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [transaksi, setTransaksi] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState([]);
  const [loading, setLoading] = useState(true);

  async function muat(paramsObj = {}) {
    setLoading(true);
    try {
      const params = new URLSearchParams(paramsObj);
      const data = await api.get(`/admin/laporan?${params.toString()}`);
      setTransaksi(data.transaksi || []);
      setTotalPendapatan(data.totalPendapatan || 0);
      setProdukTerlaris(data.produkTerlaris || []);
      setDari(data.dari || '');
      setSampai(data.sampai || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  function submitFilter(e) {
    e.preventDefault();
    const params = {};
    if (dari) params.dari = dari;
    if (sampai) params.sampai = sampai;
    muat(params);
  }

  return (
    <AdminLayout title="Laporan Penjualan">
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={submitFilter} className="filter-inline" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Dari Tanggal</label>
            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Sampai Tanggal</label>
            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            Terapkan
          </button>
        </form>
      </div>

      {loading && <p>Memuat...</p>}

      {!loading && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-card">
              <div className="num">{formatRupiah(totalPendapatan)}</div>
              <div className="label">Total Pendapatan (tidak termasuk yang dibatalkan)</div>
            </div>
            <div className="stat-card">
              <div className="num">{transaksi.length}</div>
              <div className="label">Jumlah Transaksi</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Produk Terlaris</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Total Terjual</th>
                </tr>
              </thead>
              <tbody>
                {produkTerlaris.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nama_produk}</td>
                    <td>{p.total_terjual}</td>
                  </tr>
                ))}
                {produkTerlaris.length === 0 && (
                  <tr>
                    <td colSpan={2}>Belum ada data penjualan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Daftar Transaksi</h3>
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
                {transaksi.map((t) => (
                  <tr key={t.id}>
                    <td>{t.kode_transaksi}</td>
                    <td>{t.nama_pembeli}</td>
                    <td>{formatRupiah(t.total_harga)}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                    </td>
                    <td>{formatTanggal(t.created_at)}</td>
                  </tr>
                ))}
                {transaksi.length === 0 && (
                  <tr>
                    <td colSpan={5}>Tidak ada transaksi pada rentang ini.</td>
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
