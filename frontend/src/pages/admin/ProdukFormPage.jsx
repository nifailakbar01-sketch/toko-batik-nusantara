import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api, urlGambar } from '../../api/client';

const kosong = {
  nama_produk: '',
  kategori_id: '',
  deskripsi: '',
  harga: '',
  stok: '',
  motif: '',
  bahan: '',
  is_active: true
};

export default function ProdukFormPage() {
  const { id } = useParams();
  const mode = id ? 'edit' : 'tambah';
  const navigate = useNavigate();

  const [kategori, setKategori] = useState([]);
  const [form, setForm] = useState(kosong);
  const [gambarLama, setGambarLama] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [errorUmum, setErrorUmum] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/kategori').then((data) => setKategori(data.kategori || []));
  }, []);

  useEffect(() => {
    if (mode === 'edit') {
      api
        .get(`/admin/produk/${id}`)
        .then((data) => {
          const p = data.produk;
          setForm({
            nama_produk: p.nama_produk,
            kategori_id: p.kategori_id,
            deskripsi: p.deskripsi || '',
            harga: p.harga,
            stok: p.stok,
            motif: p.motif || '',
            bahan: p.bahan || '',
            is_active: !!p.is_active
          });
          setGambarLama(p.gambar);
        })
        .finally(() => setLoading(false));
    }
  }, [id, mode]);

  function pesanError(field) {
    const e = errors.find((er) => er.path === field || er.param === field);
    return e ? e.msg : null;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    setErrorUmum('');

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'is_active') {
        if (value) fd.append('is_active', '1');
      } else {
        fd.append(key, value);
      }
    });
    if (file) fd.append('gambar', file);

    try {
      const path = mode === 'tambah' ? '/admin/produk/tambah' : `/admin/produk/edit/${id}`;
      await api.post(path, fd, { isForm: true });
      navigate('/admin/produk');
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

  if (loading) {
    return (
      <AdminLayout title="Produk">
        <p>Memuat...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={mode === 'tambah' ? 'Tambah Produk' : 'Edit Produk'}>
      <div className="card">
        {errorUmum && <div className="flash flash-error">{errorUmum}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nama Produk</label>
              <input
                type="text"
                value={form.nama_produk}
                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
              />
              {pesanError('nama_produk') && <div className="form-error">{pesanError('nama_produk')}</div>}
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select
                value={form.kategori_id}
                onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
              >
                <option value="">Pilih kategori</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
              {pesanError('kategori_id') && <div className="form-error">{pesanError('kategori_id')}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <textarea
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Harga</label>
              <input
                type="number"
                min="0"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
              />
              {pesanError('harga') && <div className="form-error">{pesanError('harga')}</div>}
            </div>
            <div className="form-group">
              <label>Stok</label>
              <input
                type="number"
                min="0"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
              />
              {pesanError('stok') && <div className="form-error">{pesanError('stok')}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Motif</label>
              <input type="text" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bahan</label>
              <input type="text" value={form.bahan} onChange={(e) => setForm({ ...form, bahan: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Gambar Produk</label>
            {gambarLama && gambarLama !== 'default-produk.jpg' && (
              <div style={{ marginBottom: 8 }}>
                <img src={urlGambar(gambarLama)} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 4 }} />
              </div>
            )}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          {mode === 'edit' && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                Produk aktif ditampilkan di toko
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
