import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { PelangganAuthProvider } from './context/PelangganAuthContext';
import RequireAdmin from './components/RequireAdmin';
import RequirePelanggan from './components/RequirePelanggan';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import KatalogPage from './pages/KatalogPage';
import ProdukDetailPage from './pages/ProdukDetailPage';
import KeranjangPage from './pages/KeranjangPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuksesPage from './pages/CheckoutSuksesPage';
import NotFoundPage from './pages/NotFoundPage';

import RegisterPage from './pages/akun/RegisterPage';
import PelangganLoginPage from './pages/akun/LoginPage';
import AkunPage from './pages/akun/AkunPage';
import RiwayatPesananPage from './pages/akun/RiwayatPesananPage';

import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProdukListPage from './pages/admin/ProdukListPage';
import ProdukFormPage from './pages/admin/ProdukFormPage';
import KategoriPage from './pages/admin/KategoriPage';
import TransaksiListPage from './pages/admin/TransaksiListPage';
import TransaksiDetailPage from './pages/admin/TransaksiDetailPage';
import LaporanPage from './pages/admin/LaporanPage';

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <PelangganAuthProvider>
        <CartProvider>
          <Routes>
          {/* Toko publik */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/katalog" element={<PublicLayout><KatalogPage /></PublicLayout>} />
          <Route path="/produk/:slug" element={<PublicLayout><ProdukDetailPage /></PublicLayout>} />
          <Route path="/keranjang" element={<PublicLayout><KeranjangPage /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
          <Route path="/checkout/sukses/:kode" element={<PublicLayout><CheckoutSuksesPage /></PublicLayout>} />

          {/* Akun Pelanggan */}
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><PelangganLoginPage /></PublicLayout>} />
          <Route
            path="/akun"
            element={
              <PublicLayout>
                <RequirePelanggan>
                  <AkunPage />
                </RequirePelanggan>
              </PublicLayout>
            }
          />
          <Route
            path="/akun/pesanan"
            element={
              <PublicLayout>
                <RequirePelanggan>
                  <RiwayatPesananPage />
                </RequirePelanggan>
              </PublicLayout>
            }
          />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <DashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produk"
            element={
              <RequireAdmin>
                <ProdukListPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produk/tambah"
            element={
              <RequireAdmin>
                <ProdukFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produk/edit/:id"
            element={
              <RequireAdmin>
                <ProdukFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/kategori"
            element={
              <RequireAdmin>
                <KategoriPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/transaksi"
            element={
              <RequireAdmin>
                <TransaksiListPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/transaksi/:id"
            element={
              <RequireAdmin>
                <TransaksiDetailPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/laporan"
            element={
              <RequireAdmin>
                <LaporanPage />
              </RequireAdmin>
            }
          />

          {/* 404 */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
          </Routes>
        </CartProvider>
      </PelangganAuthProvider>
    </AdminAuthProvider>
  );
}
