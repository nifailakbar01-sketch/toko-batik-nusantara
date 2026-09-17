import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Flash from '../../components/Flash';
import { api, urlGambar } from '../../api/client';
import { formatRupiah } from '../../utils/format';

export default function ProdukListPage() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);

  async function muat() {
    setLoading(true);
    try {
      const data = await api.get('/admin/produk');
      setProduk(data.produk || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function hapus(id, nama) {
    if (!window.confirm(`Hapus produk "${nama}"?`)) return;
    try {
      const data = await api.post(`/admin/produk/hapus/${id}`);
      setPesan({ type: 'success', message: data.message });
      muat();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  return (
    <AdminLayout title="Kelola Produk">
      <div className="topbar">
        <Flash type={pesan?.type} message={pesan?.message} />
        <Link to="/admin/produk/tambah" className="btn btn-primary">
          + Tambah Produk
        </Link>
      </div>

      {loading && <p>Memuat...</p>}

      {!loading && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {produk.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.gambar && p.gambar !== 'default-produk.jpg' && (
                    <img src={urlGambar(p.gambar)} alt={p.nama_produk} className="thumb-sm" />
                  )}
                </td>
                <td>{p.nama_produk}</td>
                <td>{p.nama_kategori}</td>
                <td>{formatRupiah(p.harga)}</td>
                <td className={p.stok <= 5 ? 'stok-menipis' : ''}>{p.stok}</td>
                <td>{p.is_active ? 'Aktif' : 'Nonaktif'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/admin/produk/edit/${p.id}`} className="btn btn-secondary btn-sm">
                    Edit
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => hapus(p.id, p.nama_produk)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {produk.length === 0 && (
              <tr>
                <td colSpan={7}>Belum ada produk.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
