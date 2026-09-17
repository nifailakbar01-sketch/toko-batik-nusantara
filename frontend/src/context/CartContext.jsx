import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [jumlahItem, setJumlahItem] = useState(0);

  const refreshJumlah = useCallback(async () => {
    try {
      const data = await api.get('/keranjang');
      setJumlahItem(data.jumlahItem || 0);
    } catch {
      setJumlahItem(0);
    }
  }, []);

  useEffect(() => {
    refreshJumlah();
  }, [refreshJumlah]);

  return (
    <CartContext.Provider value={{ jumlahItem, setJumlahItem, refreshJumlah }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}
