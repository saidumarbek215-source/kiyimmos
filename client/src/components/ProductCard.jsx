import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ProductCard({ product, initialLiked = false }) {
  const navigate = useNavigate();
  const { initData } = useApp();
  const [liked, setLiked] = useState(initialLiked);
  const [liking, setLiking] = useState(false);

  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p) + ' so\'m';

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    setLiked((v) => !v);
    try {
      await fetch(`${API_URL}/favorites/${product.id}`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData || 'dev-mode' },
      });
    } catch {
      setLiked((v) => !v); // rollback
    } finally {
      setLiking(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer border border-gray-100"
    >
      {/* Rasm */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">👗</div>
        )}

        {/* Sevimli tugmasi */}
        <button
          onClick={toggleLike}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all
            ${liked ? 'bg-pink-500' : 'bg-white/90'}`}
        >
          <svg viewBox="0 0 24 24" className={`w-4 h-4 ${liked ? 'fill-white' : 'fill-none stroke-gray-400'}`} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Jins badge */}
        {product.gender && product.gender !== 'unisex' && (
          <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-gray-600">
            {product.gender === 'male' ? 'Erkak' : product.gender === 'female' ? 'Ayol' : 'Bola'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs text-gray-800 font-semibold line-clamp-2 leading-tight">{product.title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.shop_name}</p>

        {/* O'lchamlar */}
        {product.sizes?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {product.sizes.slice(0, 3).map((s) => (
              <span key={s} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{s}</span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[9px] text-gray-400">+{product.sizes.length - 3}</span>
            )}
          </div>
        )}

        <p className="text-pink-600 font-bold text-sm mt-1.5">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
