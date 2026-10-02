"""
AURA Cosmetics — Production Settings
Works on Render, Railway, Heroku, and any PaaS.
"""
from .base import *   # noqa: F401, F403
from decouple import config
import os

DEBUG = False

# ─── Database ─────────────────────────────────────────────────────────────────
# Render / Railway provide DATABASE_URL as a full URI.
# Fall back to individual vars for other platforms.
_DATABASE_URL = os.environ.get('DATABASE_URL', '')

if _DATABASE_URL:
    # Parse DATABASE_URL (postgres://user:pass@host:port/dbname)
    # dj-database-url handles this cleanly
    try:
        import dj_database_url
        DATABASES = {'default': dj_database_url.config(
            default=_DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
        )}
    except ImportError:
        # Fallback: parse manually
        from urllib.parse import urlparse
        _db = urlparse(_DATABASE_URL)
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': _db.path.lstrip('/'),
                'USER': _db.username,
                'PASSWORD': _db.password,
                'HOST': _db.hostname,
                'PORT': str(_db.port or 5432),
                'CONN_MAX_AGE': 60,
                'OPTIONS': {'connect_timeout': 10},
            }
        }
else:
    # Individual vars (self-hosted / Docker)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME':     config('DB_NAME'),
            'USER':     config('DB_USER'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST':     config('DB_HOST'),
            'PORT':     config('DB_PORT', default='5432'),
            'CONN_MAX_AGE': 60,
            'OPTIONS': {'connect_timeout': 10},
        }
    }

# ─── Cache / Celery — Redis URL ───────────────────────────────────────────────
# Override base.py's graceful-fallback cache with a hard Redis requirement
_REDIS_URL = os.environ.get('REDIS_URL', config('REDIS_URL', default=''))
if _REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': _REDIS_URL,
            'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'TIMEOUT': 300,
        }
    }
    SESSION_ENGINE      = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'default'
    CELERY_BROKER_URL     = _REDIS_URL
    CELERY_RESULT_BACKEND = _REDIS_URL

# ─── CORS ─────────────────────────────────────────────────────────────────────
_FRONTEND = config('FRONTEND_URL', default='https://auracosmetics.in')
CORS_ALLOWED_ORIGINS = [_FRONTEND]
# Allow additional origins via comma-separated env var
_EXTRA = os.environ.get('CORS_EXTRA_ORIGINS', '')
if _EXTRA:
    CORS_ALLOWED_ORIGINS += [o.strip() for o in _EXTRA.split(',') if o.strip()]

# ─── Allowed hosts ────────────────────────────────────────────────────────────
# Render injects the service URL; accept *.onrender.com + custom domain
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])
ALLOWED_HOSTS += ['.onrender.com', '.railway.app']

# ─── Security ─────────────────────────────────────────────────────────────────
# Render terminates SSL at the load balancer, so SSL redirect must be OFF
# (the platform already enforces HTTPS externally)
SECURE_SSL_REDIRECT              = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SECURE_HSTS_SECONDS              = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS   = True
SECURE_HSTS_PRELOAD              = True
SESSION_COOKIE_SECURE            = True
CSRF_COOKIE_SECURE               = True
SECURE_BROWSER_XSS_FILTER        = True
SECURE_CONTENT_TYPE_NOSNIFF      = True
X_FRAME_OPTIONS                  = 'DENY'
# Trust Render's proxy for the real client IP / HTTPS detection
SECURE_PROXY_SSL_HEADER          = ('HTTP_X_FORWARDED_PROTO', 'https')

# ─── CSRF ─────────────────────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = [_FRONTEND, 'https://*.onrender.com']

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

# ─── Logging ──────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
    'loggers': {
        'django':         {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'django.request': {'handlers': ['console'], 'level': 'ERROR',   'propagate': False},
    },
}
