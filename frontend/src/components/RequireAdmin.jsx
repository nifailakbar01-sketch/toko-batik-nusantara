import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return <div className="container"><p>Memuat...</p></div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
