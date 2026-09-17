import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePelangganAuth } from '../context/PelangganAuthContext';

export default function Header() {
  const { jumlahItem } = useCart();
  const { pelanggan, loading } = usePelangganAuth();

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand">
          Batik Nusantara <small>KARYA PENGRAJIN LOKAL</small>
        </Link>
        <nav className="nav-links">
          <Link to="/">Beranda</Link>
          <Link to="/katalog">Katalog</Link>
          <Link to="/keranjang" className="nav-cart">
            Keranjang{jumlahItem > 0 ? ` (${jumlahItem})` : ''}
          </Link>
          {!loading && pelanggan && (
            <Link to="/akun">Halo, {pelanggan.nama_lengkap.split(' ')[0]}</Link>
          )}
          {!loading && !pelanggan && <Link to="/login">Masuk / Daftar</Link>}
        </nav>
      </div>
    </header>
  );
}
