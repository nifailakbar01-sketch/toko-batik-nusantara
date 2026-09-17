import { useState } from 'react';
import { urlAset } from '../api/client';
import { formatRupiah } from '../utils/format';

/**
 * Menampilkan detail pembayaran sesuai metode yang dipilih:
 * - transfer_bank -> daftar nomor rekening penjual (+ tombol salin)
 * - e_wallet      -> gambar QRIS penjual
 * - cod           -> catatan bayar di tempat
 */
export default function PanelPembayaran({ info, total }) {
  const [tersalin, setTersalin] = useState('');

  if (!info) return null;

  async function salin(teks, kunci) {
    try {
      await navigator.clipboard.writeText(teks);
    } catch {
      // Fallback browser lama / halaman non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = teks;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setTersalin(kunci);
    setTimeout(() => setTersalin(''), 2000);
  }

  return (
    <div className="panel-bayar">
      <div className="panel-bayar-head">
        <h3>{info.label}</h3>
        {total > 0 && (
          <span className="nominal-bayar">
            Total: <strong>{formatRupiah(total)}</strong>
          </span>
        )}
      </div>

      {/* ---------- TRANSFER BANK: nomor rekening penjual ---------- */}
      {info.tipe === 'rekening' && (
        <div className="rekening-list">
          {info.rekening.map((r) => (
            <div key={r.nomor} className="rekening-item">
              <div className="rekening-bank">{r.bank}</div>
              <div className="rekening-nomor">{r.nomor}</div>
              <div className="rekening-atasnama">a.n. {r.atas_nama}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => salin(r.nomor, r.nomor)}
              >
                {tersalin === r.nomor ? 'Tersalin!' : 'Salin Nomor'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- E-WALLET: gambar QRIS penjual ---------- */}
      {info.tipe === 'qris' && (
        <div className="qris-box">
          <img src={urlAset(info.qris.gambar)} alt={`QRIS ${info.qris.merchant}`} className="qris-img" />
          <div className="qris-info">
            <div className="qris-merchant">{info.qris.merchant}</div>
            <div className="qris-nmid">NMID: {info.qris.nmid}</div>
            <div className="qris-logos">
              {info.qris.didukung.map((w) => (
                <span key={w} className="tag-wallet">
                  {w}
                </span>
              ))}
            </div>
            <a
              href={urlAset(info.qris.gambar)}
              download="qris-toko-batik-nusantara.png"
              className="btn btn-outline btn-sm"
            >
              Unduh QRIS
            </a>
          </div>
        </div>
      )}

      {/* ---------- Instruksi (semua metode) ---------- */}
      <ol className="instruksi-bayar">
        {info.instruksi.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ol>

      {info.butuh_bukti && (
        <p className="catatan-bukti">
          Setelah menekan <strong>Buat Pesanan</strong>, Anda akan diarahkan ke halaman konfirmasi untuk
          mengunggah <strong>foto bukti pembayaran</strong>.
        </p>
      )}
    </div>
  );
}
