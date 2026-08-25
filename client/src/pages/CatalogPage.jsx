import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import BannerSlider from '../components/BannerSlider';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const CAT_ICONS = {
  men: '👔', women: '👗', kids: '👶', sport: '⚽', accessories: '🧢', shoes: '👟',
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { totalItems } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: '',
    size: '',
    min_price: '',
    max_price: '',
  });

  const fetchProducts = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (search) params.set('search', search);

      const res = await fetch(`${API_URL}/products?${params}`);
      const data = await res.json();
      setProducts((prev) => reset ? data.products : [...prev, ...data.products]);
      setTotal(data.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    fetch(`${API_URL}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
    fetch(`${API_URL}/banners`).then(r => r.json()).then(setBanners).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(1, true); }, [filters, search]);

  const setCategory = (slug) =>
    setFilters(p => ({ ...p, category: p.category === slug ? '' : slug }));

  const toggleFilter = (key, val) =>
    setFilters(p => ({ ...p, [key]: p[key] === val ? '' : val }));

  const activeFilterCount = [filters.gender, filters.size, filters.min_price, filters.max_price]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          {showSearch ? (
            <>
              <input
                autoFocus
                type="search"
                placeholder="Tovar qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
              />
              <button onClick={() => { setShowSearch(false); setSearch(''); }} className="text-gray-500 text-sm font-medium">
                Bekor
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-xl">👗</span>
                <span className="text-lg font-black text-gray-900 tracking-tight">KiyimMos</span>
              </div>
              <button onClick={() => setShowSearch(true)}
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                🔍
              </button>
              <button onClick={() => setShowFilters(v => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center relative
                  ${showFilters ? 'bg-pink-500' : 'bg-gray-100'}`}>
                <span className={showFilters ? 'grayscale-0' : ''}>⚙️</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/cart')}
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center relative">
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3 bg-white">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Jins</p>
              <div className="flex gap-2">
                {[{v:'',l:'Hammasi'},{v:'male',l:'👨 Erkak'},{v:'female',l:'👩 Ayol'},{v:'kids',l:'👶 Bola'}].map(g => (
                  <button key={g.v} onClick={() => toggleFilter('gender', g.v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                      ${filters.gender === g.v ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">O'lcham</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map(s => (
                  <button key={s} onClick={() => toggleFilter('size', s)}
                    className={`w-10 h-8 rounded-lg text-xs font-bold transition-colors
                      ${filters.size === s ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Min narx" value={filters.min_price}
                onChange={e => setFilters(p => ({...p, min_price: e.target.value}))}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"/>
              <input type="number" placeholder="Max narx" value={filters.max_price}
                onChange={e => setFilters(p => ({...p, max_price: e.target.value}))}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"/>
            </div>
            <button onClick={() => setFilters({category: filters.category, gender:'', size:'', min_price:'', max_price:''})}
              className="text-pink-500 text-sm font-semibold">
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Banner */}
      {banners.length > 0 && <BannerSlider banners={banners} />}

      {/* Kategoriyalar */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategory('')}
            className={`flex-none flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
              ${!filters.category ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-semibold">Hammasi</span>
          </button>
          {categories.map(cat => (
            <button key={cat.slug} onClick={() => setCategory(cat.slug)}
              className={`flex-none flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
                ${filters.category === cat.slug ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              <span className="text-xl">{CAT_ICONS[cat.slug] || '👗'}</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">{cat.name_uz}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tovarlar */}
      <div className="px-4 mt-4 pb-4">
        {!loading && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium">{total} ta tovar</p>
            {filters.category && (
              <button onClick={() => setCategory('')} className="text-xs text-pink-500 font-semibold">
                × Filtr olib tashlash
              </button>
            )}
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                <div className="aspect-[3/4] bg-gray-200"/>
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"/>
                  <div className="h-3 bg-gray-200 rounded w-1/2"/>
                  <div className="h-4 bg-gray-200 rounded w-1/3"/>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">Tovar topilmadi</p>
            <p className="text-gray-400 text-sm mt-1">Boshqa filtr sinab ko'ring</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {products.length < total && (
              <button onClick={() => fetchProducts(page + 1)} disabled={loading}
                className="w-full mt-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold disabled:opacity-50">
                {loading ? 'Yuklanmoqda...' : `Ko'proq ko'rsatish (${total - products.length} ta qoldi)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
