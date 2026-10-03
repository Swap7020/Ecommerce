# ── AURA Cosmetics — Backend Dockerfile ──────────────────────────────────────
# Used by Render (Web Service) and Docker Compose.
# Render injects $PORT at runtime (default 10000).
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        libjpeg-dev \
        zlib1g-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Application code
COPY . .

# Render uses $PORT (typically 10000); default to 8000 for Docker Compose
EXPOSE 10000

# Collect static, migrate, then start gunicorn
# collectstatic uses development settings (SQLite, no external services)
CMD ["sh", "-c", \
     "DJANGO_SETTINGS_MODULE=config.settings.development python manage.py collectstatic --noinput && \
      python manage.py migrate --noinput && \
      gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 3 --timeout 120 --log-level info --access-logfile -"]
