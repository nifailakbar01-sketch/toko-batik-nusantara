export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="col">
            <h4>Batik Nusantara</h4>
            <p>
              Menghubungkan pengrajin batik lokal dengan pecinta batik di seluruh Indonesia.
              Setiap helai kain menyimpan cerita dan tradisi turun-temurun.
            </p>
          </div>
          <div className="col">
            <h4>Tautan</h4>
            <a href="/">Beranda</a>
            <a href="/katalog">Katalog</a>
            <a href="/keranjang">Keranjang</a>
          </div>
          <div className="col">
            <h4>Kontak</h4>
            <p>hello@batiknusantara.id</p>
            <p>+62 812-3456-7890</p>
          </div>
        </div>
        <div className="copyright">&copy; {new Date().getFullYear()} Batik Nusantara. Ujian Praktik Kompetensi Junior Web Developer.</div>
      </div>
    </footer>
  );
}
