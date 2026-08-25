import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function AdminPage() {
  const { apiRequest } = useApp();
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' | 'approved'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, shopsData] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest(`/admin/shops?status=${tab}`),
      ]);
      setStats(statsData);
      setShops(shopsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveShop = async (id) => {
    try {
      await apiRequest(`/admin/shops/${id}/approve`, { method: 'PUT' });
      loadData();
    } catch (err) { alert(err.message); }
  };

  const rejectShop = async (id) => {
    if (!confirm('Magazinni bloklaysizmi?')) return;
    try {
      await apiRequest(`/admin/shops/${id}/reject`, { method: 'PUT' });
      loadData();
    } catch (err) { alert(err.message); }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-4xl">🔒</div>
        <p className="text-gray-600 text-center font-medium">Admin huquqi kerak</p>
        <p className="text-xs text-gray-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">⚙️  Admin Panel</h1>

        {/* Statistika */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Magazinlar', value: stats.totalShops, icon: '🏪', color: 'bg-blue-50' },
              { label: 'Tovarlar', value: stats.totalProducts, icon: '📦', color: 'bg-green-50' },
              { label: 'Kutuvchi', value: stats.pendingShops, icon: '⏳', color: 'bg-yellow-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tablar */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: 'pending', label: '⏳ Kutuvchi' },
          { key: 'approved', label: '✅ Tasdiqlangan' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors
              ${tab === t.key ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Magazinlar ro'yxati */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">{tab === 'pending' ? '🎉' : '📭'}</div>
            <p className="text-gray-500">
              {tab === 'pending' ? 'Kutuvchi magazin yo\'q' : 'Magazin yo\'q'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl flex-none">
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{shop.name}</p>
                    {shop.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{shop.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {shop.phone && <span className="text-xs text-gray-400">📞 {shop.phone}</span>}
                      {shop.username && (
                        <span className="text-xs text-blue-400">@{shop.username}</span>
                      )}
                      {shop.address && <span className="text-xs text-gray-400">📍 {shop.address}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Tovarlar: {shop.product_count || 0} | ID: {shop.telegram_id}
                    </p>
                  </div>
                </div>

                {/* Tugmalar */}
                {tab === 'pending' ? (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveShop(shop.id)}
                      className="flex-1 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl"
                    >
                      ✅ Tasdiqlash
                    </button>
                    <button
                      onClick={() => rejectShop(shop.id)}
                      className="flex-1 py-2.5 bg-red-100 text-red-600 text-sm font-bold rounded-xl"
                    >
                      ❌ Rad etish
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => rejectShop(shop.id)}
                    className="w-full mt-3 py-2.5 bg-red-100 text-red-600 text-sm font-bold rounded-xl"
                  >
                    🚫 Bloklash
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
