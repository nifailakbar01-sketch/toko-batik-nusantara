import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const menu = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/produk', label: 'Produk' },
  { to: '/admin/kategori', label: 'Kategori' },
  { to: '/admin/transaksi', label: 'Transaksi' },
  { to: '/admin/laporan', label: 'Laporan' }
];

export default function AdminLayout({ children, title }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">Batik Nusantara</div>
        <nav>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <h1>{title}</h1>
          <div className="who">
            {admin?.nama_lengkap}{' '}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ marginLeft: 12 }}>
              Logout
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
