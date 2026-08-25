import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ShopDashboardPage() {
  const { apiRequest, shop, setShop, tgUser } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/shops/my/products');
      setData(res);
      setShop(res.shop);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (productId, isActive) => {
    try {
      const product = data.products.find((p) => p.id === productId);
      await apiRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, is_active: !isActive }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Tovanni o\'chirmoqchimisiz?')) return;
    try {
      await apiRequest(`/products/${productId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Magazin yo'q — ro'yxatdan o'tishga yo'naltirish
  if (error || !data?.shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl">🏪</div>
        <h2 className="text-xl font-bold text-gray-800">Magaziningiz yo'q</h2>
        <p className="text-sm text-gray-500 text-center">
          Tovar qo'shish uchun avval magazin oching
        </p>
        <button
          onClick={() => navigate('/shop-login')}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-2xl text-base"
        >
          Magazin ochish
        </button>
      </div>
    );
  }

  const { shop: shopData, products } = data;

  // Tasdiqlanmagan
  if (!shopData.is_approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl">⏳</div>
        <h2 className="text-xl font-bold text-gray-800">Tasdiqlanish kutilmoqda</h2>
        <p className="text-sm text-gray-500 text-center">
          Magaziningiz <strong>{shopData.name}</strong> admin tomonidan tekshirilmoqda.
          24 soat ichida javob beriladi.
        </p>
      </div>
    );
  }

  const activeCount = products.filter((p) => p.is_active).length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
            🏪
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">{shopData.name}</h1>
            <p className="text-xs text-green-500 font-medium">✅ Tasdiqlangan</p>
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Tovarlar', value: products.length, icon: '📦' },
            { label: 'Faol', value: activeCount, icon: '✅' },
            { label: 'Ko\'rishlar', value: totalViews, icon: '👁️' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-bold text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tovarlar ro'yxati */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Mening tovarlarim</h2>
          <button
            onClick={() => navigate('/dashboard/add')}
            className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-xl"
          >
            + Qo'shish
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 mb-4">Hali tovar qo'shilmagan</p>
            <button
              onClick={() => navigate('/dashboard/add')}
              className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl text-sm"
            >
              Birinchi tovarni qo'shing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                {/* Rasm */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-none">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.title}</p>
                  <p className="text-pink-600 text-sm font-bold mt-0.5">
                    {new Intl.NumberFormat('uz-UZ').format(p.price)} so'm
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${p.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {p.is_active ? 'Faol' : 'Yashirin'}
                    </span>
                    <span className="text-xs text-gray-400">👁 {p.views || 0}</span>
                  </div>
                </div>

                {/* Tugmalar */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => navigate(`/dashboard/edit/${p.id}`)}
                    className="p-2 bg-gray-100 rounded-xl text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => toggleProduct(p.id, p.is_active)}
                    className="p-2 bg-gray-100 rounded-xl text-sm"
                  >
                    {p.is_active ? '🙈' : '👁️'}
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 bg-red-50 rounded-xl text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
