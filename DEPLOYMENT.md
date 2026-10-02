# AURA Cosmetics — Deployment Guide

## Architecture

```
Internet → Frontend (Vercel/Netlify) → Backend API (Railway/Render) → PostgreSQL + Redis
```

---

## 1. Backend — Railway or Render

### Environment Variables (set on your hosting platform)

```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.railway.app

# PostgreSQL (Railway/Render provides these automatically)
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<from platform>
DB_HOST=<from platform>
DB_PORT=5432

# Redis (Upstash free tier works)
REDIS_URL=redis://default:<password>@<host>:6379

# Cloudinary (free tier — for product images)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email — SendGrid free tier
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.your-api-key
DEFAULT_FROM_EMAIL=hello@yourdomain.com

# Frontend URL (for CORS + email links)
FRONTEND_URL=https://your-frontend.vercel.app

# Payments
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Deploy commands (runs automatically on Railway/Render)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py seed_data        # first deploy only
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3
```

### Railway — one-click deploy

1. Push code to GitHub
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL plugin → copy credentials to env vars
4. Add Redis plugin → copy URL to `REDIS_URL`
5. Set all env vars above
6. Deploy — Railway runs `Procfile` automatically

### Render — deploy steps

1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
5. Add PostgreSQL and Redis from Render dashboard
6. Set env vars → Deploy

---

## 2. Frontend — Vercel (recommended)

### Environment Variables

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

### Deploy steps

1. Push code to GitHub
2. vercel.com → New Project → Import repository
3. Root Directory: `frontend`
4. Framework: Vite (auto-detected)
5. Add env vars above
6. Deploy — Vercel handles the rest

`vercel.json` is already configured with SPA rewrites.

### Netlify alternative

`netlify.toml` is pre-configured. Just connect your repo on netlify.com and set the env vars.

---

## 3. Docker — self-hosted

```bash
# Copy and fill in env
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Build and start everything
docker compose up --build -d

# First-time setup
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py seed_data
docker compose exec backend python manage.py collectstatic --noinput
```

Services:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000/api`
- Admin: `http://localhost:8000/admin`

---

## 4. Local Development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # edit if needed
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

| URL | Service |
|---|---|
| http://localhost:5173 | React Frontend |
| http://localhost:8000/admin | Django Admin (admin@aura.com / Admin123!@#) |
| http://localhost:8000/api/docs | Swagger API Docs |

---

## 5. Post-deployment checklist

- [ ] `DEBUG=False` in production env
- [ ] Strong `SECRET_KEY` set
- [ ] PostgreSQL connected and migrated
- [ ] Redis connected (cache + sessions)
- [ ] Cloudinary configured (product images)
- [ ] Email provider configured (SendGrid)
- [ ] Payment keys set (Razorpay/Stripe)
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] `FRONTEND_URL` set for CORS
- [ ] Admin superuser created
- [ ] `seed_data` run (first deploy only)
- [ ] Custom domain configured on hosting platform
- [ ] SSL certificate active (automatic on Railway/Vercel/Render)
