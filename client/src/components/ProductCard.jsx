import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const img = product.images?.[0];

  const formatPrice = (price) =>
    new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer"
    >
      {/* Rasm */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            👗
          </div>
        )}
        {product.gender && product.gender !== 'unisex' && (
          <span className="absolute top-2 left-2 bg-white/90 text-xs font-medium px-2 py-0.5 rounded-full text-gray-600">
            {product.gender === 'male' ? '👨' : product.gender === 'female' ? '👩' : '👶'}
          </span>
        )}
      </div>

      {/* Ma'lumotlar */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{product.shop_name}</p>

        {/* O'lchamlar */}
        {product.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[10px] text-gray-400">+{product.sizes.length - 4}</span>
            )}
          </div>
        )}

        <p className="text-pink-600 font-bold text-sm mt-2">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
