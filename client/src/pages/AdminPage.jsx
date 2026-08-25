import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminPage() {
  const { apiRequest } = useApp();
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [banners, setBanners] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerForm, setBannerForm] = useState({ image_url: '', title: '', subtitle: '', link_type: 'none', link_value: '', sort_order: 0 });
  const [showBannerForm, setShowBannerForm] = useState(false);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [statsData, shopsData, bannersData] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest(`/admin/shops?status=${tab}`),
        fetch(`${API_URL}/banners`).then(r => r.json()),
      ]);
      setStats(statsData); setShops(shopsData); setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const approveShop = async (id) => {
    try { await apiRequest(`/admin/shops/${id}/approve`, { method: 'PUT' }); loadData(); }
    catch (err) { alert(err.message); }
  };

  const rejectShop = async (id) => {
    if (!confirm('Bloklaysizmi?')) return;
    try { await apiRequest(`/admin/shops/${id}/reject`, { method: 'PUT' }); loadData(); }
    catch (err) { alert(err.message); }
  };

  const addBanner = async () => {
    if (!bannerForm.image_url) return alert('Rasm URL majburiy');
    try {
      await apiRequest('/banners', { method: 'POST', body: JSON.stringify(bannerForm) });
      setBannerForm({ image_url: '', title: '', subtitle: '', link_type: 'none', link_value: '', sort_order: 0 });
      setShowBannerForm(false); loadData();
    } catch (err) { alert(err.message); }
  };

  const toggleBanner = async (banner) => {
    try {
      await apiRequest(`/banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...banner, is_active: !banner.is_active }),
      });
      loadData();
    } catch (err) { alert(err.message); }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Bannerni o\'chirmoqchimisiz?')) return;
    try { await apiRequest(`/banners/${id}`, { method: 'DELETE' }); loadData(); }
    catch (err) { alert(err.message); }
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
      <div className="text-4xl">🔒</div>
      <p className="text-gray-600 font-medium">Admin huquqi kerak</p>
      <p className="text-xs text-gray-400">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">⚙️ Admin Panel</h1>
        {stats && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { l: 'Magazinlar', v: stats.totalShops, icon: '🏪', bg: 'bg-blue-50' },
              { l: 'Tovarlar', v: stats.totalProducts, icon: '📦', bg: 'bg-green-50' },
              { l: 'Kutuvchi', v: stats.pendingShops, icon: '⏳', bg: 'bg-yellow-50' },
            ].map(s => (
              <div key={s.l} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                <div className="text-lg">{s.icon}</div>
                <div className="font-bold text-gray-800 text-base">{s.v}</div>
                <div className="text-[10px] text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {[
          { key: 'pending', label: '⏳ Kutuvchi' },
          { key: 'approved', label: '✅ Magazinlar' },
          { key: 'banners', label: '🖼 Bannerlar' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-none px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
              ${tab === t.key ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* === BANNERLAR ===  */}
        {tab === 'banners' && (
          <div className="space-y-3">
            <button onClick={() => setShowBannerForm(v => !v)}
              className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl text-sm">
              {showBannerForm ? '× Yopish' : '+ Yangi banner qo\'shish'}
            </button>

            {showBannerForm && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Rasm URL *</label>
                  <input type="url" placeholder="https://example.com/banner.jpg"
                    value={bannerForm.image_url}
                    onChange={e => setBannerForm(p => ({...p, image_url: e.target.value}))}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Sarlavha</label>
                    <input type="text" placeholder="Chegirmalar 50%"
                      value={bannerForm.title}
                      onChange={e => setBannerForm(p => ({...p, title: e.target.value}))}
                      className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Tartib raqami</label>
                    <input type="number" value={bannerForm.sort_order}
                      onChange={e => setBannerForm(p => ({...p, sort_order: parseInt(e.target.value)||0}))}
                      className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Qo'shimcha matn</label>
                  <input type="text" placeholder="Yangi kolleksiya..."
                    value={bannerForm.subtitle}
                    onChange={e => setBannerForm(p => ({...p, subtitle: e.target.value}))}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Havola turi</label>
                  <select value={bannerForm.link_type}
                    onChange={e => setBannerForm(p => ({...p, link_type: e.target.value}))}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option value="none">Havolasiz</option>
                    <option value="category">Kategoriya</option>
                    <option value="shop">Magazin</option>
                  </select>
                </div>
                {bannerForm.link_type !== 'none' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      {bannerForm.link_type === 'category' ? 'Kategoriya slug (men, women...)' : 'Magazin ID'}
                    </label>
                    <input type="text"
                      value={bannerForm.link_value}
                      onChange={e => setBannerForm(p => ({...p, link_value: e.target.value}))}
                      className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none"/>
                  </div>
                )}
                {bannerForm.image_url && (
                  <img src={bannerForm.image_url} className="w-full h-28 object-cover rounded-xl" alt="preview"/>
                )}
                <button onClick={addBanner}
                  className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl">
                  ✅ Saqlash
                </button>
              </div>
            )}

            {banners.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">🖼</div>
                <p className="text-gray-500 text-sm">Hali banner qo'shilmagan</p>
              </div>
            ) : banners.map(b => (
              <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <img src={b.image_url} className="w-full h-28 object-cover" alt=""/>
                <div className="p-3 flex items-center gap-2">
                  <div className="flex-1">
                    {b.title && <p className="font-semibold text-sm text-gray-800">{b.title}</p>}
                    <p className="text-xs text-gray-400">Tartib: {b.sort_order} | {b.is_active ? '✅ Faol' : '🔴 Yashirin'}</p>
                  </div>
                  <button onClick={() => toggleBanner(b)}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold">
                    {b.is_active ? 'Yashir' : 'Ko\'rsat'}
                  </button>
                  <button onClick={() => deleteBanner(b.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold">
                    O'chir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === MAGAZINLAR === */}
        {(tab === 'pending' || tab === 'approved') && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{tab === 'pending' ? '🎉' : '📭'}</div>
              <p className="text-gray-500">{tab === 'pending' ? 'Kutuvchi magazin yo\'q' : 'Magazin yo\'q'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shops.map(shop => (
                <div key={shop.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center text-xl flex-none">🏪</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800">{shop.name}</p>
                      {shop.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{shop.description}</p>}
                      <div className="flex flex-wrap gap-x-3 mt-1">
                        {shop.phone && <span className="text-xs text-gray-400">📞 {shop.phone}</span>}
                        {shop.username && <span className="text-xs text-blue-400">@{shop.username}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Tovarlar: {shop.product_count || 0}</p>
                    </div>
                  </div>
                  {tab === 'pending' ? (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => approveShop(shop.id)}
                        className="flex-1 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl">
                        ✅ Tasdiqlash
                      </button>
                      <button onClick={() => rejectShop(shop.id)}
                        className="flex-1 py-2.5 bg-red-100 text-red-600 text-sm font-bold rounded-xl">
                        ❌ Rad etish
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => rejectShop(shop.id)}
                      className="w-full mt-3 py-2.5 bg-red-100 text-red-600 text-sm font-bold rounded-xl">
                      🚫 Bloklash
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
