import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const GENDERS = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'male', label: '👨 Erkak' },
  { value: 'female', label: '👩 Ayol' },
  { value: 'kids', label: '👶 Bola' },
];

export default function AddProductPage() {
  const { id: editId } = useParams();
  const { apiRequest } = useApp();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    sizes: [],
    colors: '',
    images: '',
    gender: 'unisex',
  });

  useEffect(() => {
    fetch(`${API_URL}/categories`).then((r) => r.json()).then(setCategories).catch(() => {});

    // Tahrirlash rejimi
    if (editId) {
      fetch(`${API_URL}/products/${editId}`)
        .then((r) => r.json())
        .then((p) => {
          setForm({
            title: p.title || '',
            description: p.description || '',
            price: p.price || '',
            category_id: p.category_id || '',
            sizes: p.sizes || [],
            colors: (p.colors || []).join(', '),
            images: (p.images || []).join('\n'),
            gender: p.gender || 'unisex',
          });
        })
        .catch(() => {});
    }
  }, [editId]);

  const toggleSize = (s) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(s) ? prev.sizes.filter((x) => x !== s) : [...prev.sizes, s],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      setError('Sarlavha va narx majburiy');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      sizes: form.sizes,
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      images: form.images.split('\n').map((u) => u.trim()).filter(Boolean),
      gender: form.gender,
    };

    try {
      if (editId) {
        await apiRequest(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600">← Orqaga</button>
        <h1 className="font-bold text-gray-800 flex-1">
          {editId ? 'Tovarni tahrirlash' : 'Yangi tovar'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Sarlavha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sarlavha <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Masalan: Qizil ko'ylak"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Narx */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Narx (so'm) <span className="text-pink-500">*</span>
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            placeholder="150000"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Kategoriya */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
          >
            <option value="">— Tanlang —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_uz}</option>
            ))}
          </select>
        </div>

        {/* Jins */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Jins</label>
          <div className="flex gap-2 flex-wrap">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors
                  ${form.gender === g.value ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-600'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* O'lchamlar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">O'lchamlar</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`w-12 h-10 rounded-xl text-sm font-bold border-2 transition-colors
                  ${form.sizes.includes(s) ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Ranglar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ranglar <span className="text-gray-400 font-normal">(vergul bilan)</span>
          </label>
          <input
            type="text"
            value={form.colors}
            onChange={(e) => setForm((p) => ({ ...p, colors: e.target.value }))}
            placeholder="Qizil, Ko'k, Yashil"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Rasmlar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rasm URL'lar <span className="text-gray-400 font-normal">(har biri yangi qatorda)</span>
          </label>
          <textarea
            value={form.images}
            onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 resize-none"
          />
        </div>

        {/* Tavsif */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Tovar haqida batafsil..."
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-2xl text-base disabled:opacity-50"
        >
          {loading ? 'Saqlanmoqda...' : editId ? '✅ Yangilash' : '🚀 Tovar qo\'shish'}
        </button>
      </form>
    </div>
  );
}
