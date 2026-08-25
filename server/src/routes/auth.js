const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth } = require('../middleware/telegramAuth');

// POST /api/auth/shop-login — magazin kirishi yoki ro'yxatdan o'tishi
router.post('/shop-login', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id, username, first_name, last_name } = req.telegramUser;
    const { name, description, phone, address } = req.body;

    // Mavjud magazinni tekshirish
    let result = await db.query(
      'SELECT * FROM shops WHERE telegram_id = $1',
      [telegram_id]
    );

    if (result.rows.length > 0) {
      return res.json({ shop: result.rows[0], isNew: false });
    }

    // Yangi magazin yaratish
    const shopName = name || `${first_name || ''} ${last_name || ''}`.trim() || 'Yangi Magazin';
    result = await db.query(
      `INSERT INTO shops (telegram_id, username, name, description, phone, address, is_approved, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE) RETURNING *`,
      [telegram_id, username, shopName, description || null, phone || null, address || null]
    );

    res.status(201).json({ shop: result.rows[0], isNew: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/auth/shop-profile — profil yangilash
router.put('/shop-profile', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const { name, description, phone, address } = req.body;

    const result = await db.query(
      `UPDATE shops SET name=$1, description=$2, phone=$3, address=$4
       WHERE telegram_id=$5 RETURNING *`,
      [name, description, phone, address, telegram_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    res.json({ shop: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/auth/me — joriy magazin ma'lumotlari
router.get('/me', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const result = await db.query(
      'SELECT * FROM shops WHERE telegram_id = $1',
      [telegram_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Magazin topilmadi' });
    }

    res.json({ shop: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
