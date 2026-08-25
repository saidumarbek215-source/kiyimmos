import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BannerSlider({ banners }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  if (!banners.length) return null;

  const handleClick = (banner) => {
    if (banner.link_type === 'category') navigate(`/?category=${banner.link_value}`);
    else if (banner.link_type === 'shop') navigate(`/shop/${banner.link_value}`);
  };

  return (
    <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden" style={{ height: 160 }}>
      {banners.map((b, i) => (
        <div
          key={b.id}
          onClick={() => handleClick(b)}
          className={`absolute inset-0 transition-opacity duration-500 cursor-pointer
            ${i === active ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={b.image_url} alt={b.title || ''} className="w-full h-full object-cover" />
          {(b.title || b.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              {b.title && <p className="text-white font-bold text-base leading-tight">{b.title}</p>}
              {b.subtitle && <p className="text-white/80 text-xs mt-0.5">{b.subtitle}</p>}
            </div>
          )}
        </div>
      ))}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all ${i === active ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
