FROM python:3.12-slim

# ── Build-time env ────────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

# ── System packages needed for psycopg2, Pillow, etc. ────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libwebp-dev \
    libffi-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python packages ───────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# ── Copy application code ─────────────────────────────────────────────────────
COPY . .

# ── Collect static files ─────────────────────────────────────────────────────
# Use a minimal inline settings override so collectstatic
# never needs a real DB or Cloudinary connection
RUN SECRET_KEY=railway-build-only \
    DATABASE_URL=sqlite:////tmp/b.db \
    CLOUDINARY_CLOUD_NAME="" \
    DJANGO_SETTINGS_MODULE=config.settings.development \
    python manage.py collectstatic --noinput 2>&1 || true

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Runtime startup ───────────────────────────────────────────────────────────
# Railway sets $PORT automatically; we migrate on every deploy start
CMD sh -c "python manage.py migrate --noinput && \
           gunicorn config.wsgi:application \
               --bind 0.0.0.0:${PORT:-8000} \
               --workers 2 \
               --threads 2 \
               --timeout 120 \
               --log-level info \
               --access-logfile -"
