import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, urlGambar } from '../api/client';
import { formatRupiah } from '../utils/format';
import { useCart } from '../context/CartContext';
import ProdukCard from '../components/ProdukCard';
import Flash from '../components/Flash';

export default function ProdukDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshJumlah } = useCart();

  const [produk, setProduk] = useState(null);
  const [terkait, setTerkait] = useState([]);
  const [jumlah, setJumlah] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pesan, setPesan] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setPesan(null);
    api
      .get(`/produk/${slug}`)
      .then((data) => {
        setProduk(data.produk);
        setTerkait(data.terkait || []);
        setJumlah(1);
      })
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function tambahKeKeranjang(e) {
    e.preventDefault();
    setPesan(null);
    try {
      await api.post('/keranjang/tambah', { produk_id: produk.id, jumlah });
      await refreshJumlah();
      setPesan({ type: 'success', message: 'Produk ditambahkan ke keranjang.' });
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    }
  }

  if (loading) return <div className="container"><p>Memuat...</p></div>;
  if (notFound) return <div className="container"><p>Produk tidak ditemukan.</p></div>;
  if (!produk) return null;

  return (
    <div className="container">
      <div className="detail-produk">
        <div className="thumb-lg">
          {produk.gambar && produk.gambar !== 'default-produk.jpg' ? (
            <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} />
          ) : (
            <span>{produk.motif || produk.nama_produk}</span>
          )}
        </div>
        <div>
          <span className="kategori-label">{produk.nama_kategori}</span>
          <h1>{produk.nama_produk}</h1>
          <p>{produk.deskripsi}</p>
          <ul className="meta-list">
            <li>
              <strong>Motif</strong>
              {produk.motif || '-'}
            </li>
            <li>
              <strong>Bahan</strong>
              {produk.bahan || '-'}
            </li>
            <li>
              <strong>Stok</strong>
              {produk.stok}
            </li>
          </ul>
          <div className="harga-besar">{formatRupiah(produk.harga)}</div>

          <Flash type={pesan?.type} message={pesan?.message} />

          {produk.stok > 0 ? (
            <form className="qty-form" onSubmit={tambahKeKeranjang}>
              <input
                type="number"
                min="1"
                max={produk.stok}
                value={jumlah}
                onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <button type="submit" className="btn btn-primary">
                Tambah ke Keranjang
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/keranjang')}>
                Lihat Keranjang
              </button>
            </form>
          ) : (
            <div className="flash flash-error">Stok produk ini sedang habis.</div>
          )}
        </div>
      </div>

      {terkait.length > 0 && (
        <section className="block">
          <div className="section-head">
            <h2>Produk Terkait</h2>
          </div>
          <div className="produk-grid">
            {terkait.map((p) => (
              <ProdukCard key={p.id} produk={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
