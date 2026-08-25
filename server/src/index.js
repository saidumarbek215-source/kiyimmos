require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const shopRoutes = require('./routes/shops');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const bannerRoutes = require('./routes/banners');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'KiyimMos', version: '1.1.0' });
});

app.use((req, res) => res.status(404).json({ error: 'Route topilmadi' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server xatosi' });
});

app.listen(PORT, () => {
  console.log(`✅ KiyimMos v1.1.0 ishlamoqda: http://localhost:${PORT}`);
});
