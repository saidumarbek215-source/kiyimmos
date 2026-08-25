const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth, requireAdmin } = require('../middleware/telegramAuth');

// Barcha admin routelar auth + admin tekshiruvidan o'tadi
router.use(requireTelegramAuth, requireAdmin);

// GET /api/admin/shops — barcha magazinlar (tasdiqlangan + kutuvchi)
router.get('/shops', async (req, res) => {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'all'
    let condition = '';
    if (status === 'pending') condition = 'WHERE s.is_approved = FALSE';
    else if (status === 'approved') condition = 'WHERE s.is_approved = TRUE';

    const result = await db.query(
      `SELECT s.*, COUNT(p.id) AS product_count
       FROM shops s
       LEFT JOIN products p ON s.id = p.shop_id
       ${condition}
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/admin/shops/:id/approve — magazinni tasdiqlash
router.put('/shops/:id/approve', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE shops SET is_approved = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    res.json({ message: 'Magazin tasdiqlandi', shop: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/admin/shops/:id/reject — magazinni bloklash
router.put('/shops/:id/reject', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE shops SET is_approved = FALSE, is_active = FALSE WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    res.json({ message: 'Magazin bloklandi', shop: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/admin/stats — statistika
router.get('/stats', async (req, res) => {
  try {
    const [shops, products, pending] = await Promise.all([
      db.query('SELECT COUNT(*) FROM shops WHERE is_approved = TRUE'),
      db.query('SELECT COUNT(*) FROM products WHERE is_active = TRUE'),
      db.query('SELECT COUNT(*) FROM shops WHERE is_approved = FALSE'),
    ]);

    res.json({
      totalShops: parseInt(shops.rows[0].count),
      totalProducts: parseInt(products.rows[0].count),
      pendingShops: parseInt(pending.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/admin/categories — kategoriyalar
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/admin/categories — yangi kategoriya
router.post('/categories', async (req, res) => {
  try {
    const { name_uz, name_ru, slug } = req.body;
    const result = await db.query(
      'INSERT INTO categories (name_uz, name_ru, slug) VALUES ($1, $2, $3) RETURNING *',
      [name_uz, name_ru, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
