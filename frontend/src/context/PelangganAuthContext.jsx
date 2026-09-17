import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const PelangganAuthContext = createContext(null);

export function PelangganAuthProvider({ children }) {
  const [pelanggan, setPelanggan] = useState(null);
  const [loading, setLoading] = useState(true);

  const cekSesi = useCallback(async () => {
    try {
      const data = await api.get('/pelanggan/me');
      setPelanggan(data.pelanggan);
    } catch {
      setPelanggan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cekSesi();
  }, [cekSesi]);

  async function register(form) {
    const data = await api.post('/pelanggan/register', form);
    setPelanggan(data.pelanggan);
    return data.pelanggan;
  }

  async function login(email, password) {
    const data = await api.post('/pelanggan/login', { email, password });
    setPelanggan(data.pelanggan);
    return data.pelanggan;
  }

  async function logout() {
    await api.post('/pelanggan/logout');
    setPelanggan(null);
  }

  async function updateProfil(form) {
    const data = await api.post('/pelanggan/profil', form);
    setPelanggan(data.pelanggan);
    return data.pelanggan;
  }

  return (
    <PelangganAuthContext.Provider
      value={{ pelanggan, loading, register, login, logout, updateProfil }}
    >
      {children}
    </PelangganAuthContext.Provider>
  );
}

export function usePelangganAuth() {
  const ctx = useContext(PelangganAuthContext);
  if (!ctx) throw new Error('usePelangganAuth harus dipakai di dalam PelangganAuthProvider');
  return ctx;
}
