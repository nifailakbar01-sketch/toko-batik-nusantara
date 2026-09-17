export function formatRupiah(angka) {
  const n = Number(angka) || 0;
  return 'Rp' + n.toLocaleString('id-ID');
}

export function formatTanggal(tgl) {
  if (!tgl) return '-';
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export const STATUS_LABEL = {
  menunggu_pembayaran: 'Menunggu Pembayaran',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan'
};
