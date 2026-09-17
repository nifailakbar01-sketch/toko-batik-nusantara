import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProdukCard from '../components/ProdukCard';

export default function KatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriAktif = searchParams.get('kategori') || '';
  const keyword = searchParams.get('q') || '';

  const [qInput, setQInput] = useState(keyword);
  const [produk, setProduk] = useState([]);
  const [semuaKategori, setSemuaKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setQInput(keyword);
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (kategoriAktif) params.set('kategori', kategoriAktif);
    if (keyword) params.set('q', keyword);

    api
      .get(`/katalog?${params.toString()}`)
      .then((data) => {
        setProduk(data.produk || []);
        setSemuaKategori(data.semuaKategori || []);
      })
      .catch(() => setError('Gagal memuat katalog.'))
      .finally(() => setLoading(false));
  }, [kategoriAktif, keyword]);

  function handleCari(e) {
    e.preventDefault();
    const params = {};
    if (kategoriAktif) params.kategori = kategoriAktif;
    if (qInput) params.q = qInput;
    setSearchParams(params);
  }

  function pilihKategori(slug) {
    const params = {};
    if (slug) params.kategori = slug;
    if (keyword) params.q = keyword;
    setSearchParams(params);
  }

  return (
    <div className="container">
      <section className="block">
        <div className="section-head">
          <div>
            <h1>Katalog Produk</h1>
            <p>Temukan batik pilihan Anda</p>
          </div>
        </div>

        <div className="filter-bar">
          <form onSubmit={handleCari} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Cari produk, motif..."
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              Cari
            </button>
          </form>

          <select value={kategoriAktif} onChange={(e) => pilihKategori(e.target.value)}>
            <option value="">Semua Kategori</option>
            {semuaKategori.map((k) => (
              <option key={k.id} value={k.slug}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Memuat...</p>}
        {error && <div className="flash flash-error">{error}</div>}
        {!loading && !error && produk.length === 0 && <p>Belum ada produk yang cocok.</p>}

        {!loading && !error && (
          <div className="produk-grid">
            {produk.map((p) => (
              <ProdukCard key={p.id} produk={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
