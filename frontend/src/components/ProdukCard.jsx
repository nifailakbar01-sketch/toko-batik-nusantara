import { Link } from 'react-router-dom';
import { urlGambar } from '../api/client';
import { formatRupiah } from '../utils/format';

export default function ProdukCard({ produk }) {
  return (
    <div className="produk-card">
      <Link to={`/produk/${produk.slug}`} className="thumb">
        {produk.gambar && produk.gambar !== 'default-produk.jpg' ? (
          <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} />
        ) : (
          <span>{produk.motif || produk.nama_produk}</span>
        )}
      </Link>
      <div className="info">
        {produk.nama_kategori && <span className="kategori-label">{produk.nama_kategori}</span>}
        <h3>
          <Link to={`/produk/${produk.slug}`}>{produk.nama_produk}</Link>
        </h3>
        <span className="harga">{formatRupiah(produk.harga)}</span>
        <span className="stok">Stok: {produk.stok}</span>
      </div>
    </div>
  );
}
