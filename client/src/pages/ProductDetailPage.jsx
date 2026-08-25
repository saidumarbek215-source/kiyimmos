import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!product || product.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Tovar topilmadi</p>
      <button onClick={() => navigate('/')} className="text-pink-600 font-medium">Orqaga</button>
    </div>
  );

  const handleContact = () => {
    const tg = window.Telegram?.WebApp;
    if (product.shop_username) tg?.openTelegramLink(`https://t.me/${product.shop_username}`);
    else if (product.shop_telegram_id) tg?.openTelegramLink(`tg://user?id=${product.shop_telegram_id}`);
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert("Iltimos o'lcham tanlang");
      return;
    }
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const fmt = (p) => new Intl.NumberFormat('uz-UZ').format(p) + ' so\'m';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rasm */}
      <div className="relative bg-white">
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700 font-bold">
          ←
        </button>

        <div className="aspect-square overflow-hidden">
          {product.images?.length > 0 ? (
            <img src={product.images[activeImg]} alt={product.title} className="w-full h-full object-cover"/>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center text-7xl text-gray-200">👗</div>
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`flex-none w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors
                  ${activeImg === i ? 'border-pink-500' : 'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" alt=""/>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Narx va sarlavha */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-black text-pink-600">{fmt(product.price)}</p>
          <h1 className="text-base font-bold text-gray-800 mt-1">{product.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{product.category_name}</p>
          {product.views > 0 && <p className="text-xs text-gray-400 mt-1">👁 {product.views} marta ko'rildi</p>}
        </div>

        {/* O'lchamlar */}
        {product.sizes?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3">O'lcham tanlang</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`min-w-[48px] h-10 px-3 rounded-xl font-bold text-sm border-2 transition-colors
                    ${selectedSize === s ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ranglar */}
        {product.colors?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-2">Ranglar</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tavsif */}
        {product.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-1">Tavsif</p>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Magazin */}
        <div onClick={() => navigate(`/shop/${product.shop_id}`)}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl">🏪</div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{product.shop_name}</p>
            <p className="text-xs text-gray-400">Magazin sahifasi →</p>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex gap-3 pb-4">
          <button onClick={handleAddToCart}
            className={`flex-1 py-4 font-bold rounded-2xl text-base transition-colors
              ${added ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
            {added ? '✅ Qo\'shildi!' : '🛒 Korzinaga'}
          </button>
          <button onClick={handleContact}
            className="flex-1 py-4 bg-pink-500 text-white font-bold rounded-2xl text-base">
            💬 Yozish
          </button>
        </div>
      </div>
    </div>
  );
}
