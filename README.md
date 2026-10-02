# AURA Cosmetics — Premium E-Commerce Platform

> *"Reveal Your Natural Aura."*

A full-stack, production-ready e-commerce platform for a premium cosmetics brand, built with Django REST Framework and React.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Seed Data](#seed-data)
- [Features](#features)
- [Deployment](#deployment)
- [Payment Integration](#payment-integration)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, Django 5, Django REST Framework |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, Celery |
| Frontend | React 18, Vite, Tailwind CSS |
| State | Redux Toolkit |
| Auth | JWT (SimpleJWT) |
| Media | Cloudinary |
| Payments | Razorpay / Stripe / COD |
| Containerisation | Docker, Docker Compose |

---

## Project Structure

```
AURA_Cosmetics/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # User auth, profiles, addresses
│   │   ├── categories/     # Product categories & concerns
│   │   ├── products/       # Products, brands, banners
│   │   ├── cart/           # Shopping cart (auth + guest)
│   │   ├── wishlist/       # Wishlist
│   │   ├── orders/         # Orders, checkout, dashboard
│   │   ├── payments/       # Razorpay / Stripe / COD
│   │   ├── reviews/        # Product reviews
│   │   ├── coupons/        # Discount coupons
│   │   └── notifications/  # Notifications, newsletter
│   ├── config/             # Django settings, URLs, Celery
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # All page components
│   │   ├── store/          # Redux store + slices
│   │   ├── services/       # Axios API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Formatters, helpers
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Docker)

The fastest way to run the entire platform:

```bash
# 1. Clone and enter the project
cd AURA_Cosmetics

# 2. Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 3. Start everything
docker compose up --build

# 4. In a new terminal, run migrations and seed data
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py seed_data
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8000/api |
| API Docs (Swagger) | http://localhost:8000/api/docs |
| Django Admin | http://localhost:8000/admin |

---

## Manual Setup

### Backend

**Prerequisites:** Python 3.12+, PostgreSQL, Redis

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database and Redis settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed demo data
python manage.py seed_data

# Start development server
python manage.py runserver

# Start Celery worker (separate terminal)
celery -A config worker -l info
```

### Frontend

**Prerequisites:** Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit VITE_API_URL if backend is not at localhost:8000

# Start development server
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.

### Required for Development

```env
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=aura_cosmetics
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
```

### Required for Production

```env
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=yourdomain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
EMAIL_HOST_PASSWORD=<sendgrid-api-key>
```

---

## API Documentation

Interactive API documentation is available via **Swagger UI**:

```
http://localhost:8000/api/docs/
```

ReDoc format:
```
http://localhost:8000/api/redoc/
```

### Core Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/auth/register/` | Create account |
| `POST /api/auth/login/` | Login, get JWT tokens |
| `POST /api/auth/refresh/` | Refresh access token |
| `GET /api/auth/profile/` | Get/update profile |
| `GET /api/products/` | List products (filter, search, sort) |
| `GET /api/products/{slug}/` | Product detail + related |
| `GET /api/products/homepage/` | All homepage data in one call |
| `GET /api/categories/` | All active categories |
| `GET /api/cart/` | Get cart |
| `POST /api/cart/items/` | Add item to cart |
| `GET /api/wishlist/` | Get wishlist |
| `POST /api/wishlist/{product_id}/` | Toggle wishlist |
| `POST /api/orders/checkout/` | Place order |
| `GET /api/orders/` | Order history |
| `POST /api/coupons/validate/` | Validate coupon |
| `POST /api/payments/initiate/` | Initiate payment |
| `POST /api/payments/verify/` | Verify Razorpay payment |

### Product Filtering

```
GET /api/products/?category=makeup&brand=aura
GET /api/products/?min_price=200&max_price=1000
GET /api/products/?min_rating=4&in_stock=true
GET /api/products/?search=lipstick&ordering=-rating
GET /api/products/?is_new_arrival=true
GET /api/products/?is_best_seller=true
```

---

## Seed Data

The seed command populates the database with 11 realistic AURA products across 8 categories:

```bash
python manage.py seed_data
```

**Products included:**
- AURA Velvet Matte Lipstick (5 shades)
- AURA Glow Foundation (5 shades)
- AURA Nude Eyeshadow Palette
- AURA Waterproof Kajal
- AURA Waterproof Mascara
- AURA Hydrating Face Serum (2 sizes)
- AURA Vitamin C Brightening Serum
- AURA Daily Moisturiser SPF 30
- AURA Radiance Face Wash
- AURA Glazed Lip Gloss (3 shades)
- AURA Beauty Blender (2 colours)

**Coupons seeded:**
| Code | Discount | Min Order |
|---|---|---|
| `AURA10` | 10% off first order | ₹500 |
| `FREESHIP` | Free shipping | Any |
| `GLOW20` | 20% off | ₹800 |
| `FLAT150` | ₹150 flat off | ₹1499 |

---

## Features

### Customer
- Register / Login / Forgot Password / Email Verification
- Browse products with advanced filtering and search
- Product detail with image gallery, variants, reviews
- Shopping cart (authenticated + guest session)
- Wishlist
- Multi-step checkout (Address → Delivery → Payment → Review)
- Razorpay / Stripe / COD payment
- Order tracking with status history
- Customer dashboard (profile, addresses, orders)
- Coupon / promo codes
- Newsletter subscription

### Admin
- Django Admin with custom registrations
- Product / category / brand / coupon management
- Order status management and history
- Review moderation (approve/reject)
- Dashboard KPI API (revenue, orders, customers, low stock)

### Technical
- JWT authentication with automatic token refresh
- Guest cart with merge-on-login
- Redis caching (homepage data, search suggestions)
- Celery for background tasks (emails)
- Pagination, filtering, search on all list endpoints
- SEO-friendly slugged URLs
- CORS configured for frontend

---

## Payment Integration

### Razorpay (Indian Payments)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get Key ID and Key Secret from Dashboard → Settings → API Keys
3. Add to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. Add to `frontend/.env.local`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_...
   ```

**Flow:** `POST /api/orders/checkout/` → `POST /api/payments/initiate/` → Frontend opens Razorpay modal → `POST /api/payments/verify/`

### Stripe (International)

1. Sign up at [stripe.com](https://stripe.com)
2. Get keys from Dashboard → Developers → API Keys
3. Add to `backend/.env`:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Cash on Delivery

No configuration needed. Select COD at checkout — order is confirmed immediately.

---

## Deployment

### Backend (Railway / Render / AWS)

```bash
# Set production environment variables
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://...  # or individual DB_* vars

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn (auto-configured in Dockerfile)
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

### Frontend (Vercel / Netlify)

```bash
# Build command
npm run build

# Output directory
dist

# Environment variables
VITE_API_URL=https://api.yourdomain.com/api
```

### Full Docker Production

```bash
# Production compose (add your .env values)
docker compose -f docker-compose.yml up -d --build
```

---

## Django Admin

Access at `http://localhost:8000/admin/`

Login with the superuser you created. The admin provides:
- Full product/category/brand management
- Order management with status updates
- Review moderation
- Coupon creation and tracking
- User management

---

## License

© 2024 AURA Cosmetics. All rights reserved.

Built for commercial use — not for redistribution.
