import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ShopLoginPage() {
  const { apiRequest, setShop, tgUser } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Magazin nomini kiriting'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/auth/shop-login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setShop(data.shop);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-6 text-center border-b">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="text-xl font-bold text-gray-800">Magazin ro'yxatdan o'tish</h1>
        <p className="text-sm text-gray-500 mt-1">
          {tgUser ? `Salom, ${tgUser.first_name}!` : 'Telegram orqali kirilmoqda'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Magazin nomi <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Masalan: Fashion Style Boutique"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Magazin haqida qisqacha..."
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+998 90 123 45 67"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Toshkent, Chilonzor..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-xs text-yellow-700">
            ⏳ Ro'yxatdan o'tgandan so'ng admin tomonidan tasdiqlanishi kerak. Bu 24 soat ichida bo'ladi.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-2xl text-base disabled:opacity-50"
        >
          {loading ? 'Yuborilmoqda...' : '🚀  Ro\'yxatdan o\'tish'}
        </button>
      </form>
    </div>
  );
}
