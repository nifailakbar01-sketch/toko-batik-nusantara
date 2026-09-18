import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Flash from '../../components/Flash';
import { api } from '../../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../../utils/format';

export default function TransaksiListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusAktif = searchParams.get('status') || '';
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);

  async function muatTransaksi() {
    setLoading(true);
    const q = statusAktif ? `?status=${statusAktif}` : '';
    try {
      const data = await api.get(`/admin/transaksi${q}`);
      setTransaksi(data.transaksi || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatTransaksi();
  }, [statusAktif]);

  async function hapus(id, kode) {
    if (!window.confirm(`Hapus transaksi "${kode}"?`)) return;

    try {
      const data = await api.post(`/admin/transaksi/hapus/${id}`);
      setPesan({ type: 'success', message: data.message });
      muatTransaksi();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  return (
    <AdminLayout title="Kelola Transaksi">
      <Flash type={pesan?.type} message={pesan?.message} />

      <div className="filter-inline">
        <select
          value={statusAktif}
          onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Memuat...</p>}
      {!loading && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Pembeli</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th></th>
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
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link to={`/admin/transaksi/${t.id}`} className="btn btn-secondary btn-sm">
                    Detail
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => hapus(t.id, t.kode_transaksi)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {transaksi.length === 0 && (
              <tr>
                <td colSpan={6}>Belum ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
