import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Tovar topilmadi</p>
        <button onClick={() => navigate('/')} className="text-pink-600 font-medium">
          Orqaga
        </button>
      </div>
    );
  }

  const handleContact = () => {
    const tg = window.Telegram?.WebApp;
    if (product.shop_username) {
      tg?.openTelegramLink(`https://t.me/${product.shop_username}`);
    } else if (product.shop_telegram_id) {
      tg?.openTelegramLink(`tg://user?id=${product.shop_telegram_id}`);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rasm slider */}
      <div className="relative bg-white">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
        >
          ←
        </button>

        {product.images?.length > 0 ? (
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[activeImg]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gray-100 flex items-center justify-center text-7xl">
            👗
          </div>
        )}

        {/* Rasmlar qator */}
        {product.images?.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-none w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors
                  ${activeImg === i ? 'border-pink-500' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ma'lumotlar */}
      <div className="p-4 space-y-4">
        {/* Sarlavha va narx */}
        <div>
          <h1 className="text-lg font-bold text-gray-800">{product.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{product.category_name}</p>
          <p className="text-2xl font-bold text-pink-600 mt-2">{formatPrice(product.price)}</p>
        </div>

        {/* O'lchamlar */}
        {product.sizes?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">O'lcham tanlang</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[48px] h-10 px-3 rounded-xl font-bold text-sm border-2 transition-colors
                    ${selectedSize === s
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ranglar */}
        {product.colors?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Ranglar</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tavsif */}
        {product.description && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Tavsif</p>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Magazin */}
        <div
          onClick={() => navigate(`/shop/${product.shop_id}`)}
          className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl">
            🏪
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{product.shop_name}</p>
            <p className="text-xs text-gray-400">Magazinni ko'rish →</p>
          </div>
        </div>

        {/* Bog'lanish tugmasi */}
        <button
          onClick={handleContact}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-2xl text-base active:bg-pink-600 transition-colors"
        >
          💬  Magazinga yozish
        </button>
      </div>
    </div>
  );
}
