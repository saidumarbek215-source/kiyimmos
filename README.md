# 👗 KiyimMos — Telegram Mini App

OLX uslubidagi kiyim bozori. Magazinlar tovarlarini qo'shadi, mijozlar ko'radi va Telegram orqali bog'lanadi.

---

## Loyiha tuzilmasi

```
kiyimmos/
├── client/          # React + Vite (Telegram Mini App)
├── server/          # Express + PostgreSQL (API)
└── README.md
```

---

## Funksiyalar

- 🏪 **Magazin** — Telegram orqali ro'yxatdan o'tish, tovar qo'shish, boshqarish
- 🛍️ **Katalog** — Kategoriya, o'lcham, jins, narx bo'yicha filter
- 💬 **Aloqa** — Tovar sahifasidan magazin Telegram'iga o'tish
- ⚙️ **Admin** — Yangi magazinlarni tasdiqlash, statistika

---

## 1. GitHub — yangi repo yaratish (local Mac'da)

```bash
mkdir -p ~/kiyimmos
cd ~/kiyimmos
git init
# Bu fayllarni ko'chiring yoki clone qiling
git add .
git commit -m "Initial commit — KiyimMos"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/kiyimmos.git
git push -u origin main
```

---

## 2. Server — PostgreSQL bazasi (VPS: 104.207.93.209)

```bash
ssh root@104.207.93.209

# Baza va foydalanuvchi yaratish
sudo -u postgres createdb kiyimmos_db
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"  # parol gen
sudo -u postgres psql -c "CREATE USER kiyimmos_user WITH PASSWORD 'GENERATED_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kiyimmos_db TO kiyimmos_user;"

# Schema yuklash
sudo -u postgres psql -d kiyimmos_db < /root/kiyimmos/server/src/db/schema.sql
```

---

## 3. Server — deploy

```bash
ssh root@104.207.93.209

mkdir -p /root/kiyimmos
cd /root/kiyimmos
git clone https://github.com/YOUR_GITHUB_USERNAME/kiyimmos.git .

# .env yaratish
cat > /root/kiyimmos/server/.env << 'EOF'
DATABASE_URL=postgres://kiyimmos_user:GENERATED_PASSWORD@localhost/kiyimmos_db
PORT=3002
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
BASE_URL=https://api-kiyimmos.yourdomain.uz
ADMIN_TELEGRAM_IDS=YOUR_TELEGRAM_ID
EOF

cd /root/kiyimmos/server
npm install
pm2 start src/index.js --name kiyimmos-backend
pm2 save
pm2 status
```

---

## 4. Nginx konfiguratsiyasi

```bash
sudo nano /etc/nginx/sites-available/kiyimmos
```

Kontent:

```nginx
server {
    listen 80;
    server_name api-kiyimmos.yourdomain.uz;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kiyimmos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api-kiyimmos.yourdomain.uz
```

---

## 5. Frontend deploy (Cloudflare Pages)

```bash
cd ~/kiyimmos/client

# .env yaratish
echo "VITE_API_URL=https://api-kiyimmos.yourdomain.uz/api" > .env

npm install
npm run build
npx wrangler pages deploy dist --project-name kiyimmos --commit-dirty=true
```

⚠️ `.env` ni tekshiring — bo'sh bo'lsa "oq ekran" bo'ladi!

---

## 6. Telegram Bot sozlash

1. [@BotFather](https://t.me/BotFather)'da `/newbot` → Bot yarating
2. `/newapp` → Mini App yarating
3. Mini App URL'ini Cloudflare Pages URL'iga belgilang
4. `BOT_TOKEN` ni `.env` ga qo'ying
5. `ADMIN_TELEGRAM_IDS` ga o'z Telegram ID'ingizni qo'ying
   - ID'ingizni [@userinfobot](https://t.me/userinfobot) orqali bilib olasiz

---

## 7. Yangilash sikli

```bash
# 1. Local — commit va push
git add .
git commit -m "O'zgarish tavsifi"
git push

# 2. Server — backend yangilash
ssh root@104.207.93.209
cd /root/kiyimmos
git pull
pm2 restart kiyimmos-backend

# 3. Local — frontend rebuild
cd ~/kiyimmos/client
npm run build
npx wrangler pages deploy dist --project-name kiyimmos --commit-dirty=true
```

---

## Izolyatsiya tekshiruvi

- [x] Alohida GitHub repo
- [x] Alohida PostgreSQL baza (`kiyimmos_db`)
- [x] Alohida server papkasi (`/root/kiyimmos/`)
- [x] Alohida PM2 jarayon (`kiyimmos-backend`)
- [x] Alohida port (`3002`)
- [x] Alohida Nginx konf (`api-kiyimmos.yourdomain.uz`)
- [x] `.gitignore` — `.env` birinchi commitdan boshlab
