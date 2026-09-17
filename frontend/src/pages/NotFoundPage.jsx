import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container">
      <section className="block" style={{ textAlign: 'center' }}>
        <h1>Halaman Tidak Ditemukan</h1>
        <p>Halaman yang Anda cari tidak tersedia.</p>
        <Link to="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </section>
    </div>
  );
}
