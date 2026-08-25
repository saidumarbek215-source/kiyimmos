-- KiyimMos Schema Update: banners + favorites

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(200),
  subtitle VARCHAR(300),
  link_type VARCHAR(20) DEFAULT 'none', -- 'none' | 'category' | 'shop' | 'url'
  link_value TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(telegram_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_telegram_id ON favorites(telegram_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, sort_order);
