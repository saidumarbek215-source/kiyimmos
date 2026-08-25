import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const GENDERS = [
  { value: '', label: 'Hammasi' },
  { value: 'male', label: '👨 Erkak' },
  { value: 'female', label: '👩 Ayol' },
  { value: 'kids', label: '👶 Bola' },
];

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    size: '',
    search: '',
    min_price: '',
    max_price: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res = await fetch(`${API_URL}/products?${params}`);
      const data = await res.json();

      setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
      setTotal(data.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
  }, [filters]);

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-2xl">👗</span>
          <h1 className="text-xl font-bold text-gray-800 flex-1">KiyimMos</h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
          >
            ⚙️
          </button>
        </div>

        {/* Qidiruv */}
        <div className="px-4 pb-3">
          <input
            type="search"
            placeholder="🔍  Tovar qidirish..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* Kategoriyalar (gorizontal scroll) */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <button
            onClick={() => handleFilter('category', '')}
            className={`flex-none px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${!filters.category ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Hammasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleFilter('category', cat.slug)}
              className={`flex-none px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filters.category === cat.slug ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {cat.name_uz}
            </button>
          ))}
        </div>

        {/* Filtrlar paneli */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {/* Jins */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Jins</p>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => handleFilter('gender', g.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                      ${filters.gender === g.value ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* O'lcham */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">O'lcham</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilter('size', s)}
                    className={`w-10 h-8 rounded-lg text-xs font-bold transition-colors
                      ${filters.size === s ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Narx oralig'i */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min narx"
                value={filters.min_price}
                onChange={(e) => setFilters((p) => ({ ...p, min_price: e.target.value }))}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
              />
              <input
                type="number"
                placeholder="Max narx"
                value={filters.max_price}
                onChange={(e) => setFilters((p) => ({ ...p, max_price: e.target.value }))}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>

            <button
              onClick={() => setFilters({ category: '', gender: '', size: '', search: '', min_price: '', max_price: '' })}
              className="w-full py-2 text-sm text-pink-600 font-medium"
            >
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Mahsulotlar */}
      <div className="p-4">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500">Tovar topilmadi</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} ta tovar</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {products.length < total && (
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={loading}
                className="w-full mt-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-600 font-medium disabled:opacity-50"
              >
                {loading ? 'Yuklanmoqda...' : 'Ko\'proq ko\'rsatish'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
