import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AppProvider({ children }) {
  const [tgUser, setTgUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [initData, setInitData] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      setInitData(tg.initData);
      setTgUser(tg.initDataUnsafe?.user || null);
    } else if (import.meta.env.DEV) {
      // Development test rejimi
      setInitData('dev-mode');
      setTgUser({ id: 999999999, first_name: 'Test', username: 'testuser' });
    }
    setLoading(false);
  }, []);

  // API so'rovlari uchun helper
  const apiRequest = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  };

  return (
    <AppContext.Provider value={{ tgUser, shop, setShop, initData, isAdmin, setIsAdmin, loading, apiRequest }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
