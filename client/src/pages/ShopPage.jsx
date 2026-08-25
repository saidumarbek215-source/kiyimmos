import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/shops/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!data?.shop) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Magazin topilmadi</p>
    </div>;
  }

  const { shop, products } = data;

  const handleContact = () => {
    const tg = window.Telegram?.WebApp;
    if (shop.username) tg?.openTelegramLink(`https://t.me/${shop.username}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white pb-4">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 font-medium">← Orqaga</button>
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl">
            {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover rounded-2xl" /> : '🏪'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{shop.name}</h1>
            {shop.description && <p className="text-sm text-gray-500 mt-0.5">{shop.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{products.length} ta tovar</p>
          </div>
        </div>

        {shop.username && (
          <button
            onClick={handleContact}
            className="mx-4 mt-4 w-[calc(100%-2rem)] py-3 bg-pink-500 text-white font-bold rounded-2xl text-sm"
          >
            💬  Telegram'da yozish
          </button>
        )}
      </div>

      {/* Tovarlar */}
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-500">Tovarlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
