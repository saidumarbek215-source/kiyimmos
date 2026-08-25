import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Katalog', icon: '🛍️' },
  { path: '/dashboard', label: 'Magazin', icon: '🏪' },
  { path: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path ||
          (tab.path !== '/' && location.pathname.startsWith(tab.path));
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors
              ${active ? 'text-pink-600' : 'text-gray-400'}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`font-medium ${active ? 'text-pink-600' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {active && <span className="w-1 h-1 rounded-full bg-pink-600" />}
          </button>
        );
      })}
    </nav>
  );
}
