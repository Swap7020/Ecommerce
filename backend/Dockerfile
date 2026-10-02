FROM python:3.12-slim

# ── Environment ───────────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

# ── System deps ───────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Python deps ───────────────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ── App source ────────────────────────────────────────────────────────────────
COPY . .

# ── Static files (needs dummy SECRET_KEY — no DB access during build) ─────────
RUN SECRET_KEY=build-time-placeholder \
    DATABASE_URL=sqlite:///tmp/build.db \
    python manage.py collectstatic --noinput

# ── Port ──────────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Start: migrate then serve ─────────────────────────────────────────────────
# Railway injects $PORT at runtime; default to 8000 if not set
CMD python manage.py migrate --noinput && \
    gunicorn config.wsgi:application \
        --bind 0.0.0.0:${PORT:-8000} \
        --workers 3 \
        --timeout 120 \
        --log-level info \
        --access-logfile -
