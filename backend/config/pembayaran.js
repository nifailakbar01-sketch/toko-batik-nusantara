/**
 * Konfigurasi Metode Pembayaran Toko Batik Nusantara
 * ---------------------------------------------------
 * Ubah data di file ini sesuai rekening / QRIS milik toko.
 * Dipakai oleh checkoutController untuk ditampilkan di halaman checkout
 * dan halaman sukses (instruksi pembayaran).
 */

const METODE_PEMBAYARAN = {
  transfer_bank: {
    kode: 'transfer_bank',
    label: 'Transfer Bank',
    tipe: 'rekening',
    butuh_bukti: true,
    instruksi: [
      'Transfer sesuai total pesanan ke salah satu rekening di bawah ini.',
      'Transfer tepat sampai digit terakhir agar mudah diverifikasi.',
      'Setelah transfer, unggah foto bukti transfer pada halaman konfirmasi pesanan.',
      'Pesanan diproses maksimal 1x24 jam setelah pembayaran diverifikasi admin.'
    ],
    rekening: [
      {
        bank: 'Bank BCA',
        nomor: '1234567890',
        atas_nama: 'CV Batik Nusantara'
      },
      {
        bank: 'Bank Mandiri',
        nomor: '1440012345678',
        atas_nama: 'CV Batik Nusantara'
      },
      {
        bank: 'Bank BRI',
        nomor: '002401000123456',
        atas_nama: 'CV Batik Nusantara'
      }
    ]
  },

  e_wallet: {
    kode: 'e_wallet',
    label: 'E-Wallet (QRIS)',
    tipe: 'qris',
    butuh_bukti: true,
    instruksi: [
      'Buka aplikasi e-wallet Anda (GoPay, OVO, DANA, ShopeePay, LinkAja, atau m-banking).',
      'Pilih menu Scan / Bayar, lalu pindai kode QRIS di samping.',
      'Pastikan nama merchant tertulis TOKO BATIK NUSANTARA dan nominal sesuai total pesanan.',
      'Simpan struk pembayaran, lalu unggah fotonya pada halaman konfirmasi pesanan.'
    ],
    qris: {
      merchant: 'TOKO BATIK NUSANTARA',
      nmid: 'ID1024398571024',
      gambar: '/img/qris.png',
      didukung: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'QRIS m-banking']
    }
  },

  cod: {
    kode: 'cod',
    label: 'COD (Bayar di Tempat)',
    tipe: 'cod',
    butuh_bukti: false,
    instruksi: [
      'Siapkan uang tunai sesuai total pesanan.',
      'Pembayaran dilakukan saat paket diterima di alamat pengiriman.',
      'Pastikan nomor HP aktif agar kurir dapat menghubungi Anda.',
      'COD tidak memerlukan unggah bukti pembayaran.'
    ]
  }
};

/** Daftar metode untuk dropdown di frontend */
function daftarMetode() {
  return Object.values(METODE_PEMBAYARAN).map((m) => ({
    kode: m.kode,
    label: m.label,
    tipe: m.tipe,
    butuh_bukti: m.butuh_bukti
  }));
}

/** Ambil detail satu metode, null bila tidak dikenal */
function getMetode(kode) {
  return METODE_PEMBAYARAN[kode] || null;
}

/** Cek apakah metode wajib unggah bukti pembayaran */
function butuhBukti(kode) {
  const m = getMetode(kode);
  return m ? m.butuh_bukti : false;
}

module.exports = { METODE_PEMBAYARAN, daftarMetode, getMetode, butuhBukti };
