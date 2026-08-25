import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQty, totalItems, totalPrice, clearCart } = useCart();

  const fmt = (p) => new Intl.NumberFormat('uz-UZ').format(p) + ' so\'m';

  const handleOrder = () => {
    const text = items.map(i =>
      `• ${i.product.title}${i.size ? ` (${i.size})` : ''} × ${i.qty} = ${fmt(i.qty * i.product.price)}`
    ).join('\n');
    const msg = encodeURIComponent(`Buyurtma:\n${text}\n\nJami: ${fmt(totalPrice)}`);
    // Birinchi tovarning magaziniga yozish
    const shop = items[0]?.product;
    if (shop?.shop_username) {
      window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${shop.shop_username}?text=${msg}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-bold text-gray-800">Korzina bo'sh</h2>
        <p className="text-sm text-gray-500 text-center">Tovarlarni ko'rib, yoqqanini qo'shing</p>
        <button onClick={() => navigate('/')}
          className="px-8 py-3 bg-pink-500 text-white font-bold rounded-2xl">
          Katalogga o'tish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="text-gray-600">←</button>
        <h1 className="font-bold text-gray-800 flex-1">🛒 Korzina</h1>
        <button onClick={clearCart} className="text-xs text-red-400 font-medium">Tozalash</button>
      </div>

      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.size}`}
            className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-none">
              {item.product.images?.[0]
                ? <img src={item.product.images[0]} className="w-full h-full object-cover" alt=""/>
                : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.product.title}</p>
              {item.size && <p className="text-xs text-gray-400 mt-0.5">O'lcham: {item.size}</p>}
              <p className="text-pink-600 font-bold text-sm mt-1">{fmt(item.product.price)}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeFromCart(item.product.id, item.size)}
                className="text-gray-300 text-lg leading-none">×</button>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1">
                <button onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}
                  className="w-5 h-5 flex items-center justify-center text-gray-600 font-bold">−</button>
                <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}
                  className="w-5 h-5 flex items-center justify-center text-gray-600 font-bold">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Jami */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="flex justify-between mb-3">
          <span className="text-gray-500 text-sm">{totalItems} ta tovar</span>
          <span className="font-bold text-gray-900">{fmt(totalPrice)}</span>
        </div>
        <button onClick={handleOrder}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-2xl text-base">
          💬 Buyurtma berish (Telegram)
        </button>
      </div>
    </div>
  );
}
