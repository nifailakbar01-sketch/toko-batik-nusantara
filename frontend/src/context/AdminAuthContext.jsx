import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const cekSesi = useCallback(async () => {
    try {
      const data = await api.get('/admin/me');
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cekSesi();
  }, [cekSesi]);

  async function login(username, password) {
    const data = await api.post('/admin/login', { username, password });
    setAdmin(data.admin);
    return data.admin;
  }

  async function logout() {
    await api.post('/admin/logout');
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth harus dipakai di dalam AdminAuthProvider');
  return ctx;
}
