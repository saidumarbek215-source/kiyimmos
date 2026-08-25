const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth, requireAdmin } = require('../middleware/telegramAuth');

// GET /api/banners — faol bannerlar (hammaga ochiq)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/banners — yangi banner (faqat admin)
router.post('/', requireTelegramAuth, requireAdmin, async (req, res) => {
  try {
    const { image_url, title, subtitle, link_type, link_value, sort_order } = req.body;
    if (!image_url) return res.status(400).json({ error: 'image_url majburiy' });

    const result = await db.query(
      `INSERT INTO banners (image_url, title, subtitle, link_type, link_value, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [image_url, title || null, subtitle || null, link_type || 'none', link_value || null, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/banners/:id — bannerni yangilash (faqat admin)
router.put('/:id', requireTelegramAuth, requireAdmin, async (req, res) => {
  try {
    const { image_url, title, subtitle, link_type, link_value, sort_order, is_active } = req.body;
    const result = await db.query(
      `UPDATE banners SET image_url=$1, title=$2, subtitle=$3, link_type=$4,
       link_value=$5, sort_order=$6, is_active=$7 WHERE id=$8 RETURNING *`,
      [image_url, title || null, subtitle || null, link_type || 'none',
       link_value || null, sort_order || 0, is_active !== false, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Topilmadi' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// DELETE /api/banners/:id (faqat admin)
router.delete('/:id', requireTelegramAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id=$1', [req.params.id]);
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
