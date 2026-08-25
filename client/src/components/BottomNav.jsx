import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const tabs = [
  { path: '/', label: 'Katalog', icon: '🏠' },
  { path: '/favorites', label: 'Sevimli', icon: '❤️' },
  { path: '/cart', label: 'Korzina', icon: '🛒', badge: true },
  { path: '/dashboard', label: 'Magazin', icon: '🏪' },
  { path: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path ||
          (tab.path !== '/' && location.pathname.startsWith(tab.path));
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative
              ${active ? 'text-pink-600' : 'text-gray-400'}`}>
            <span className="text-[18px] leading-tight relative">
              {tab.icon}
              {tab.badge && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 bg-pink-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </span>
            <span className={`text-[9px] font-semibold ${active ? 'text-pink-600' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pink-500 rounded-full" />}
          </button>
        );
      })}
    </nav>
  );
}
