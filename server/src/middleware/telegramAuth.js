const crypto = require('crypto');

/**
 * Telegram WebApp initData validatsiyasi
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function validateTelegramInitData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return null;

  urlParams.delete('hash');
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (expectedHash !== hash) return null;

  // auth_date eski bo'lsa (1 soatdan ko'p) rad etamiz
  const authDate = parseInt(urlParams.get('auth_date'), 10);
  if (Date.now() / 1000 - authDate > 86400) return null;

  const user = urlParams.get('user');
  return user ? JSON.parse(user) : null;
}

// Middleware: Telegram auth kerak bo'lgan routelar uchun
function requireTelegramAuth(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  if (!initData) {
    return res.status(401).json({ error: 'Telegram initData kerak' });
  }

  // Development rejimida test uchun
  if (process.env.NODE_ENV === 'development' && initData === 'dev-mode') {
    req.telegramUser = { id: 999999999, first_name: 'Dev', username: 'devuser' };
    return next();
  }

  const user = validateTelegramInitData(initData, process.env.BOT_TOKEN);
  if (!user) {
    return res.status(401).json({ error: 'Telegram autentifikatsiya muvaffaqiyatsiz' });
  }

  req.telegramUser = user;
  next();
}

// Middleware: Admin uchun
function requireAdmin(req, res, next) {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map((id) => parseInt(id.trim(), 10));

  if (!req.telegramUser || !adminIds.includes(req.telegramUser.id)) {
    return res.status(403).json({ error: 'Admin huquqi kerak' });
  }
  next();
}

module.exports = { requireTelegramAuth, requireAdmin, validateTelegramInitData };
