import { Navigate } from 'react-router-dom';
import { usePelangganAuth } from '../context/PelangganAuthContext';

export default function RequirePelanggan({ children }) {
  const { pelanggan, loading } = usePelangganAuth();

  if (loading) return <div className="container"><p>Memuat...</p></div>;
  if (!pelanggan) return <Navigate to="/login" replace />;

  return children;
}
