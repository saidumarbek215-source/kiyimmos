const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth } = require('../middleware/telegramAuth');

// GET /api/shops — barcha tasdiqlangan magazinlar
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, COUNT(p.id) AS product_count
       FROM shops s
       LEFT JOIN products p ON s.id = p.shop_id AND p.is_active = TRUE
       WHERE s.is_approved = TRUE AND s.is_active = TRUE
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/shops/:id — magazin va uning tovarlari
router.get('/:id', async (req, res) => {
  try {
    const shopResult = await db.query(
      'SELECT * FROM shops WHERE id = $1 AND is_approved = TRUE',
      [req.params.id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    const productsResult = await db.query(
      `SELECT p.*, c.name_uz AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.shop_id = $1 AND p.is_active = TRUE
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );

    res.json({
      shop: shopResult.rows[0],
      products: productsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/shops/my/products — o'z tovarlarim (magazin uchun)
router.get('/my/products', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const shopResult = await db.query(
      'SELECT * FROM shops WHERE telegram_id = $1',
      [telegram_id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    const shop = shopResult.rows[0];
    const productsResult = await db.query(
      `SELECT p.*, c.name_uz AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.shop_id = $1
       ORDER BY p.created_at DESC`,
      [shop.id]
    );

    res.json({
      shop,
      products: productsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
