import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { usePelangganAuth } from '../../context/PelangganAuthContext';

const initialForm = { nama_lengkap: '', email: '', password: '', no_hp: '' };

export default function RegisterPage() {
  const { pelanggan, register, loading } = usePelangganAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [errorUmum, setErrorUmum] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && pelanggan) return <Navigate to="/akun" replace />;

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
      await register(form);
      navigate('/akun');
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

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-box">
          <h1>Daftar Akun Baru</h1>
          <p>Buat akun untuk berbelanja lebih mudah dan memantau riwayat pesanan Anda.</p>
          {errorUmum && <div className="flash flash-error">{errorUmum}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                autoFocus
              />
              {pesanError('nama_lengkap') && <div className="form-error">{pesanError('nama_lengkap')}</div>}
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
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {pesanError('password') && <div className="form-error">{pesanError('password')}</div>}
              <small className="hint">Minimal 6 karakter.</small>
            </div>
            <div className="form-group">
              <label>Nomor HP (opsional)</label>
              <input
                type="text"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />
              {pesanError('no_hp') && <div className="form-error">{pesanError('no_hp')}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
