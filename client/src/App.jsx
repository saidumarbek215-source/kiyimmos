import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';

import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShopPage from './pages/ShopPage';
import ShopLoginPage from './pages/ShopLoginPage';
import ShopDashboardPage from './pages/ShopDashboardPage';
import AddProductPage from './pages/AddProductPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen pb-16">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/shop/:id" element={<ShopPage />} />
              <Route path="/shop-login" element={<ShopLoginPage />} />
              <Route path="/dashboard" element={<ShopDashboardPage />} />
              <Route path="/dashboard/add" element={<AddProductPage />} />
              <Route path="/dashboard/edit/:id" element={<AddProductPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AppProvider>
  );
}
