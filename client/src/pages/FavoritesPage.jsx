import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { initData } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/favorites`, {
      headers: { 'x-telegram-init-data': initData || 'dev-mode' },
    })
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [initData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600">←</button>
        <h1 className="font-bold text-gray-800">❤️ Sevimlilar</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💔</div>
            <p className="text-gray-500 font-medium">Hali sevimlilar yo'q</p>
            <button onClick={() => navigate('/')} className="mt-4 text-pink-500 font-semibold text-sm">
              Katalogga o'tish →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => <ProductCard key={p.id} product={p} initialLiked={true} />)}
          </div>
        )}
      </div>
    </div>
  );
}
