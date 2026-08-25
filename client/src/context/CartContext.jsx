import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{product, size, qty}]

  const addToCart = (product, size = '') => {
    setItems((prev) => {
      const key = `${product.id}-${size}`;
      const existing = prev.find((i) => `${i.product.id}-${i.size}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.product.id}-${i.size}` === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, size, qty: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQty = (productId, size, qty) => {
    if (qty <= 0) { removeFromCart(productId, size); return; }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, qty } : i
      )
    );
  };

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.qty * parseFloat(i.product.price), 0);
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, totalItems, totalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
