import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Flash from '../../components/Flash';
import { api, urlGambar } from '../../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../../utils/format';

export default function TransaksiDetailPage() {
  const { id } = useParams();
  const [transaksi, setTransaksi] = useState(null);
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [pesan, setPesan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    try {
      const data = await api.get(`/admin/transaksi/${id}`);
      setTransaksi(data.transaksi);
      setDetail(data.detail || []);
      setStatus(data.transaksi.status);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.post(`/admin/transaksi/${id}/status`, { status });
      setPesan({ type: 'success', message: data.message });
      muat();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Detail Transaksi">
        <p>Memuat...</p>
      </AdminLayout>
    );
  }

  if (!transaksi) {
    return (
      <AdminLayout title="Detail Transaksi">
        <p>Transaksi tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Transaksi ${transaksi.kode_transaksi}`}>
      <Flash type={pesan?.type} message={pesan?.message} />

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Informasi Pembeli</h3>
        <p>
          <strong>Nama:</strong> {transaksi.nama_pembeli}
          <br />
          <strong>Email:</strong> {transaksi.email}
          <br />
          <strong>No. HP:</strong> {transaksi.no_hp}
          <br />
          <strong>Alamat:</strong> {transaksi.alamat}
          <br />
          <strong>Metode Pembayaran:</strong> {transaksi.metode_pembayaran}
          <br />
          <strong>Tanggal:</strong> {formatTanggal(transaksi.created_at)}
        </p>

        <form onSubmit={updateStatus} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ margin: 0 }}>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            Perbarui Status
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Bukti Pembayaran</h3>
        {transaksi.metode_pembayaran === 'cod' ? (
          <p>Pesanan COD — pembayaran dilakukan saat barang diterima, tidak ada bukti transfer.</p>
        ) : transaksi.bukti_transfer ? (
          <div>
            <p>
              Diunggah pada {formatTanggal(transaksi.tanggal_bukti)}
              {transaksi.catatan_pembayaran && (
                <>
                  <br />
                  <strong>Catatan pembeli:</strong> {transaksi.catatan_pembayaran}
                </>
              )}
            </p>
            <a href={urlGambar(transaksi.bukti_transfer)} target="_blank" rel="noreferrer">
              <img
                src={urlGambar(transaksi.bukti_transfer)}
                alt="Bukti pembayaran"
                style={{
                  maxWidth: 320,
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  display: 'block',
                  marginTop: 8
                }}
              />
            </a>
            <p style={{ fontSize: '.85rem', color: '#777', marginTop: 8 }}>
              Klik gambar untuk melihat ukuran penuh.
            </p>
          </div>
        ) : (
          <p>Pembeli belum mengunggah bukti pembayaran.</p>
        )}
      </div>

      <div className="card">
        <h3>Item Pesanan</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Harga Satuan</th>
              <th>Jumlah</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detail.map((d) => (
              <tr key={d.id}>
                <td>{d.nama_produk}</td>
                <td>{formatRupiah(d.harga_satuan)}</td>
                <td>{d.jumlah}</td>
                <td>{formatRupiah(d.subtotal)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <strong>Total</strong>
              </td>
              <td>
                <strong>{formatRupiah(transaksi.total_harga)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
