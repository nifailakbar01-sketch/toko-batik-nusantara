import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProdukCard from '../components/ProdukCard';

export default function HomePage() {
  const [kategori, setKategori] = useState([]);
  const [produkUnggulan, setProdukUnggulan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/')
      .then((data) => {
        setKategori(data.kategori || []);
        setProdukUnggulan(data.produkUnggulan || []);
      })
      .catch(() => setError('Gagal memuat beranda.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
     <div className="motif-divider" />
      <section className="hero">
        <div className="container" style={{ display: 'contents' }}>
          <div>
            <h1>Warisan Batik Nusantara, Karya Tangan Pengrajin Lokal</h1>
            <p className="lede">
              Jelajahi koleksi batik tulis, batik cap, kemeja, dan aksesoris pilihan langsung dari para pengrajin di seluruh Indonesia.
            </p>
            <Link to="/katalog" className="btn btn-primary">
              Lihat Katalog
            </Link>
          </div>
         <div className="hero-visual">
  <img
    src="/hero-batik.jpg"
    alt="Batik Nusantara"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }}
  />
  <span className="tag">Batik Nusantara</span>
</div>
        </div>
      </section>

     

      <div className="container">
        {loading && <p>Memuat...</p>}
        {error && <div className="flash flash-error">{error}</div>}

        {!loading && !error && (
          <>
            <section className="block">
              <div className="section-head">
                <div>
                  <h2>Kategori Produk</h2>
                  <p>Pilih kategori batik favorit Anda</p>
                </div>
              </div>
              <div className="kategori-row">
                {kategori.map((k) => (
                  <Link key={k.id} to={`/katalog?kategori=${k.slug}`} className="kategori-chip">
                    {k.nama_kategori}
                  </Link>
                ))}
              </div>
            </section>

            <section className="block">
              <div className="section-head">
                <div>
                  <h2>Produk Unggulan</h2>
                  <p>Pilihan terbaru dari koleksi kami</p>
                </div>
                <Link to="/katalog" className="btn btn-secondary">
                  Lihat Semua
                </Link>
              </div>
              <div className="produk-grid">
                {produkUnggulan.map((p) => (
                  <ProdukCard key={p.id} produk={p} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
