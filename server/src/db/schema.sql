-- KiyimMos Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kategoriyalar
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_uz VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Magazinlar
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tovarlar
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  title VARCHAR(300) NOT NULL,
  description TEXT,
  price DECIMAL(12, 0) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UZS',
  sizes TEXT[] DEFAULT '{}',       -- ['XS','S','M','L','XL','XXL']
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  gender VARCHAR(10) DEFAULT 'unisex', -- 'male','female','kids','unisex'
  is_active BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default kategoriyalar
INSERT INTO categories (name_uz, name_ru, slug) VALUES
  ('Erkaklar kiyimi', 'Мужская одежда', 'men'),
  ('Ayollar kiyimi', 'Женская одежда', 'women'),
  ('Bolalar kiyimi', 'Детская одежда', 'kids'),
  ('Sport kiyimlari', 'Спортивная одежда', 'sport'),
  ('Kiyim-bosh', 'Головные уборы', 'accessories'),
  ('Poyabzal', 'Обувь', 'shoes')
ON CONFLICT DO NOTHING;

-- Indekslar (tezlik uchun)
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_telegram_id ON shops(telegram_id);
