import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePelangganAuth } from '../../context/PelangganAuthContext';

export default function AkunPage() {
  const { pelanggan, updateProfil, logout } = usePelangganAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama_lengkap: pelanggan?.nama_lengkap || '',
    no_hp: pelanggan?.no_hp || '',
    alamat: pelanggan?.alamat || ''
  });
  const [errors, setErrors] = useState([]);
  const [pesan, setPesan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function pesanError(field) {
    const e = errors.find((er) => er.path === field || er.param === field);
    return e ? e.msg : null;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    setPesan(null);
    try {
      await updateProfil(form);
      setPesan({ type: 'success', message: 'Profil berhasil diperbarui.' });
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      } else {
        setPesan({ type: 'error', message: err.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-box">
          <h1>Akun Saya</h1>
          <p className="hint">Email: {pelanggan?.email}</p>

          {pesan && <div className={`flash flash-${pesan.type}`}>{pesan.message}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              />
              {pesanError('nama_lengkap') && <div className="form-error">{pesanError('nama_lengkap')}</div>}
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
              <label>Alamat</label>
              <textarea
                rows={3}
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          <div className="auth-actions">
            <Link to="/akun/pesanan" className="btn btn-secondary btn-block">
              Riwayat Pesanan Saya
            </Link>
            <button className="btn btn-secondary btn-block" onClick={handleLogout} style={{ marginTop: 12 }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
