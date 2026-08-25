const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireTelegramAuth } = require('../middleware/telegramAuth');

// GET /api/products — barcha faol tovarlar (mijozlar uchun)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      gender,
      size,
      min_price,
      max_price,
      shop_id,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = ['p.is_active = TRUE', 's.is_approved = TRUE', 's.is_active = TRUE'];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (gender) {
      params.push(gender);
      conditions.push(`p.gender = $${params.length}`);
    }
    if (size) {
      params.push(size);
      conditions.push(`$${params.length} = ANY(p.sizes)`);
    }
    if (min_price) {
      params.push(parseFloat(min_price));
      conditions.push(`p.price >= $${params.length}`);
    }
    if (max_price) {
      params.push(parseFloat(max_price));
      conditions.push(`p.price <= $${params.length}`);
    }
    if (shop_id) {
      params.push(parseInt(shop_id));
      conditions.push(`p.shop_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(parseInt(limit));
    params.push(offset);

    const query = `
      SELECT p.*, s.name AS shop_name, s.phone AS shop_phone,
             s.username AS shop_username, c.name_uz AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN shops s ON p.shop_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN shops s ON p.shop_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// GET /api/products/:id — tovar detali
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, s.name AS shop_name, s.phone AS shop_phone,
              s.username AS shop_username, s.telegram_id AS shop_telegram_id,
              c.name_uz AS category_name
       FROM products p
       LEFT JOIN shops s ON p.shop_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tovar topilmadi' });
    }

    // Ko'rishlar sonini oshirish
    await db.query('UPDATE products SET views = views + 1 WHERE id = $1', [req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// POST /api/products — yangi tovar qo'shish (magazin uchun)
router.post('/', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;

    // Magazinni topish
    const shopResult = await db.query(
      'SELECT * FROM shops WHERE telegram_id = $1 AND is_approved = TRUE',
      [telegram_id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(403).json({ error: 'Tasdiqlangan magazin topilmadi' });
    }

    const shop = shopResult.rows[0];
    const { title, description, price, category_id, sizes, colors, images, gender } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Sarlavha va narx majburiy' });
    }

    const result = await db.query(
      `INSERT INTO products (shop_id, category_id, title, description, price, sizes, colors, images, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        shop.id,
        category_id || null,
        title,
        description || null,
        parseFloat(price),
        sizes || [],
        colors || [],
        images || [],
        gender || 'unisex',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// PUT /api/products/:id — tovarni yangilash
router.put('/:id', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const shopResult = await db.query(
      'SELECT id FROM shops WHERE telegram_id = $1',
      [telegram_id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(403).json({ error: 'Magazin topilmadi' });
    }

    const shop_id = shopResult.rows[0].id;
    const { title, description, price, category_id, sizes, colors, images, gender, is_active } =
      req.body;

    const result = await db.query(
      `UPDATE products SET title=$1, description=$2, price=$3, category_id=$4,
       sizes=$5, colors=$6, images=$7, gender=$8, is_active=$9, updated_at=NOW()
       WHERE id=$10 AND shop_id=$11 RETURNING *`,
      [
        title, description, parseFloat(price), category_id,
        sizes || [], colors || [], images || [], gender || 'unisex',
        is_active !== undefined ? is_active : true,
        req.params.id, shop_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tovar topilmadi yoki ruxsat yo\'q' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireTelegramAuth, async (req, res) => {
  try {
    const { id: telegram_id } = req.telegramUser;
    const shopResult = await db.query(
      'SELECT id FROM shops WHERE telegram_id = $1',
      [telegram_id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(403).json({ error: 'Magazin topilmadi' });
    }

    const shop_id = shopResult.rows[0].id;
    const result = await db.query(
      'DELETE FROM products WHERE id=$1 AND shop_id=$2 RETURNING id',
      [req.params.id, shop_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tovar topilmadi yoki ruxsat yo\'q' });
    }

    res.json({ message: 'Tovar o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;
