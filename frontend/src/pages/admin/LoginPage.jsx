import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function LoginPage() {
  const { admin, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/admin/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <h1>Login Admin</h1>
        {error && <div className="flash flash-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
