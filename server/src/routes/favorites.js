const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth } = require('../middleware/telegramAuth');

// GET /api/favorites — o'z sevimlilarim
router.get('/', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const result = await db.query(
      `SELECT p.*, s.name AS shop_name, c.name_uz AS category_name
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       LEFT JOIN shops s ON p.shop_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE f.telegram_id = $1 AND p.is_active = TRUE
       ORDER BY f.created_at DESC`,
      [telegram_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/favorites/:productId — sevimliga qo'shish/olib tashlash (toggle)
router.post('/:productId', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const product_id = parseInt(req.params.productId);

    const existing = await db.query(
      'SELECT id FROM favorites WHERE telegram_id=$1 AND product_id=$2',
      [telegram_id, product_id]
    );

    if (existing.rows.length > 0) {
      await db.query('DELETE FROM favorites WHERE telegram_id=$1 AND product_id=$2', [telegram_id, product_id]);
      res.json({ liked: false });
    } else {
      await db.query('INSERT INTO favorites (telegram_id, product_id) VALUES ($1, $2)', [telegram_id, product_id]);
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/favorites/ids — sevimli tovar IDlari (tez tekshirish uchun)
router.get('/ids', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const result = await db.query(
      'SELECT product_id FROM favorites WHERE telegram_id=$1',
      [telegram_id]
    );
    res.json(result.rows.map(r => r.product_id));
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
