import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Flash from '../../components/Flash';
import { api } from '../../api/client';

const kosong = { nama_kategori: '', deskripsi: '' };

export default function KategoriPage() {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null);
  const [form, setForm] = useState(kosong);
  const [editId, setEditId] = useState(null);

  async function muat() {
    setLoading(true);
    try {
      const data = await api.get('/admin/kategori');
      setKategori(data.kategori || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  function mulaiEdit(k) {
    setEditId(k.id);
    setForm({ nama_kategori: k.nama_kategori, deskripsi: k.deskripsi || '' });
  }

  function batalEdit() {
    setEditId(null);
    setForm(kosong);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const path = editId ? `/admin/kategori/edit/${editId}` : '/admin/kategori/tambah';
      const data = await api.post(path, form);
      setPesan({ type: 'success', message: data.message });
      batalEdit();
      muat();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  async function hapus(id, nama) {
    if (!window.confirm(`Hapus kategori "${nama}"?`)) return;
    try {
      const data = await api.post(`/admin/kategori/hapus/${id}`);
      setPesan({ type: 'success', message: data.message });
      muat();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  return (
    <AdminLayout title="Kelola Kategori">
      <Flash type={pesan?.type} message={pesan?.message} />

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nama Kategori</label>
              <input
                type="text"
                value={form.nama_kategori}
                onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <input
                type="text"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            {editId ? 'Perbarui' : 'Tambah'}
          </button>
          {editId && (
            <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={batalEdit}>
              Batal
            </button>
          )}
        </form>
      </div>

      {loading && <p>Memuat...</p>}
      {!loading && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th>Jumlah Produk</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {kategori.map((k) => (
              <tr key={k.id}>
                <td>{k.nama_kategori}</td>
                <td>{k.deskripsi}</td>
                <td>{k.jumlah_produk}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => mulaiEdit(k)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => hapus(k.id, k.nama_kategori)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {kategori.length === 0 && (
              <tr>
                <td colSpan={4}>Belum ada kategori.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
