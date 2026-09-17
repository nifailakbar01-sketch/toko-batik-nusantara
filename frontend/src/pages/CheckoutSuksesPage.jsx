import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, urlGambar } from '../api/client';
import { formatRupiah, formatTanggal, STATUS_LABEL } from '../utils/format';
import PanelPembayaran from '../components/PanelPembayaran';

export default function CheckoutSuksesPage() {
  const { kode } = useParams();
  const [transaksi, setTransaksi] = useState(null);
  const [detail, setDetail] = useState([]);
  const [pembayaran, setPembayaran] = useState(null);
  const [butuhBukti, setButuhBukti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // state form unggah bukti
  const inputFileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [catatan, setCatatan] = useState('');
  const [mengunggah, setMengunggah] = useState(false);
  const [pesan, setPesan] = useState(null);

  async function muat() {
    try {
      const data = await api.get(`/checkout/sukses/${kode}`);
      setTransaksi(data.transaksi);
      setDetail(data.detail || []);
      setPembayaran(data.pembayaran || null);
      setButuhBukti(!!data.butuhBukti);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kode]);

  function pilihFile(e) {
    const f = e.target.files[0];
    setPesan(null);
    if (!f) {
      setFile(null);
      setPreview('');
      return;
    }
    const tipeValid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tipeValid.includes(f.type)) {
      setPesan({ type: 'error', message: 'Format file harus JPG, JPEG, PNG, atau WEBP.' });
      e.target.value = '';
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setPesan({ type: 'error', message: 'Ukuran file maksimal 2MB.' });
      e.target.value = '';
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function kirimBukti(e) {
    e.preventDefault();
    if (!file) {
      setPesan({ type: 'error', message: 'Pilih foto bukti pembayaran terlebih dahulu.' });
      return;
    }
    setMengunggah(true);
    setPesan(null);
    try {
      const fd = new FormData();
      fd.append('bukti', file);
      if (catatan.trim()) fd.append('catatan', catatan.trim());

      const data = await api.post(`/checkout/${kode}/bukti`, fd, { isForm: true });
      setPesan({ type: 'success', message: data.message });
      setFile(null);
      setPreview('');
      setCatatan('');
      if (inputFileRef.current) inputFileRef.current.value = '';
      await muat();
    } catch (err) {
      setPesan({ type: 'error', message: err.message });
    } finally {
      setMengunggah(false);
    }
  }

  if (loading) return <div className="container"><p>Memuat...</p></div>;
  if (notFound || !transaksi) return <div className="container"><p>Transaksi tidak ditemukan.</p></div>;

  const sudahUnggah = !!transaksi.bukti_transfer;

  return (
    <div className="container">
      <div className="sukses-box">
        <h1>Pesanan Berhasil Dibuat!</h1>
        <p>Terima kasih, {transaksi.nama_pembeli}. Simpan kode pesanan berikut:</p>
        <p className="kode">{transaksi.kode_transaksi}</p>
        <p>
          Dipesan pada {formatTanggal(transaksi.created_at)} &middot; Status:{' '}
          <strong>{STATUS_LABEL[transaksi.status] || transaksi.status}</strong>
        </p>

        <table className="cart-table" style={{ margin: '32px auto', maxWidth: 560, textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detail.map((d) => (
              <tr key={d.id}>
                <td>{d.nama_produk}</td>
                <td>{d.jumlah}</td>
                <td>{formatRupiah(d.subtotal)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="cart-total-row">
                Total
              </td>
              <td className="cart-total-row">{formatRupiah(transaksi.total_harga)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ---------- Instruksi pembayaran (rekening / QRIS) ---------- */}
      <div className="blok-konfirmasi">
        <PanelPembayaran info={pembayaran} total={Number(transaksi.total_harga)} />

        {/* ---------- Form unggah bukti pembayaran ---------- */}
        {butuhBukti && (
          <div className="panel-bukti">
            <h3>Konfirmasi Pembayaran</h3>

            {pesan && <div className={`flash flash-${pesan.type}`}>{pesan.message}</div>}

            {sudahUnggah && (
              <div className="bukti-terkirim">
                <p>
                  Bukti pembayaran sudah diterima pada {formatTanggal(transaksi.tanggal_bukti)}. Admin akan
                  memverifikasi pesanan Anda.
                </p>
                <a href={urlGambar(transaksi.bukti_transfer)} target="_blank" rel="noreferrer">
                  <img
                    src={urlGambar(transaksi.bukti_transfer)}
                    alt="Bukti pembayaran"
                    className="bukti-thumb"
                  />
                </a>
              </div>
            )}

            <form onSubmit={kirimBukti}>
              <div className="form-group">
                <label>{sudahUnggah ? 'Ganti Foto Bukti Pembayaran' : 'Foto Bukti Pembayaran'}</label>
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={pilihFile}
                />
                <small className="hint">Format JPG, JPEG, PNG, atau WEBP. Ukuran maksimal 2MB.</small>
              </div>

              {preview && (
                <div className="preview-bukti">
                  <img src={preview} alt="Pratinjau bukti pembayaran" />
                </div>
              )}

              <div className="form-group">
                <label>Catatan (opsional)</label>
                <input
                  type="text"
                  maxLength={255}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: transfer dari BCA a.n. Budi Santoso"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={mengunggah}>
                {mengunggah ? 'Mengirim...' : sudahUnggah ? 'Kirim Ulang Bukti' : 'Kirim Bukti Pembayaran'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '32px 0 64px' }}>
        <Link to="/katalog" className="btn btn-secondary">
          Lanjut Belanja
        </Link>
      </div>
    </div>
  );
}
