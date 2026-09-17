import { useState } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { usePelangganAuth } from '../../context/PelangganAuthContext';

export default function LoginPage() {
  const { pelanggan, login, loading } = usePelangganAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && pelanggan) return <Navigate to="/akun" replace />;

  const tujuan = location.state?.dari || '/akun';

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(tujuan);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-box">
          <h1>Masuk ke Akun</h1>
          {error && <div className="flash flash-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
