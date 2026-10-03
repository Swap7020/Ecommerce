"""
AURA Cosmetics — Production Settings
Works on Render (native Python runtime).
DATABASE_URL is provided by Render's PostgreSQL plugin at runtime.
During build time (no DATABASE_URL), falls back to SQLite so collectstatic works.
"""
from .base import *   # noqa: F401, F403
from decouple import config
import os

DEBUG = False

# ─── Database ─────────────────────────────────────────────────────────────────
_DATABASE_URL = os.environ.get('DATABASE_URL', '')

if _DATABASE_URL:
    # Runtime: Render / Railway / Heroku provides a full DATABASE_URL
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                default=_DATABASE_URL,
                conn_max_age=60,
                conn_health_checks=True,
            )
        }
    except ImportError:
        from urllib.parse import urlparse
        _db = urlparse(_DATABASE_URL)
        DATABASES = {
            'default': {
                'ENGINE':       'django.db.backends.postgresql',
                'NAME':         _db.path.lstrip('/'),
                'USER':         _db.username,
                'PASSWORD':     _db.password or '',
                'HOST':         _db.hostname,
                'PORT':         str(_db.port or 5432),
                'CONN_MAX_AGE': 60,
                'OPTIONS':      {'connect_timeout': 10},
            }
        }
else:
    # Build time (no DATABASE_URL yet) — use SQLite so collectstatic works
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME':   '/tmp/aura_build.db',
        }
    }

# ─── Redis / Cache ────────────────────────────────────────────────────────────
_REDIS_URL = os.environ.get('REDIS_URL', config('REDIS_URL', default=''))
if _REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND':  'django_redis.cache.RedisCache',
            'LOCATION': _REDIS_URL,
            'OPTIONS':  {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'TIMEOUT':  300,
        }
    }
    SESSION_ENGINE      = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'default'
    CELERY_BROKER_URL     = _REDIS_URL
    CELERY_RESULT_BACKEND = _REDIS_URL

# ─── CORS ─────────────────────────────────────────────────────────────────────
_FRONTEND = config('FRONTEND_URL', default='https://aura-frontend.onrender.com')
CORS_ALLOWED_ORIGINS = [_FRONTEND]
_EXTRA = os.environ.get('CORS_EXTRA_ORIGINS', '')
if _EXTRA:
    CORS_ALLOWED_ORIGINS += [o.strip() for o in _EXTRA.split(',') if o.strip()]

# ─── Allowed hosts ────────────────────────────────────────────────────────────
_hosts_str = config('ALLOWED_HOSTS', default='')
ALLOWED_HOSTS = [h.strip() for h in _hosts_str.split(',') if h.strip()]
ALLOWED_HOSTS += ['.onrender.com']

# ─── Security ─────────────────────────────────────────────────────────────────
# Render terminates SSL at the edge — do NOT redirect internally
SECURE_SSL_REDIRECT            = False
SECURE_PROXY_SSL_HEADER        = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS            = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD            = True
SESSION_COOKIE_SECURE          = True
CSRF_COOKIE_SECURE             = True
SECURE_CONTENT_TYPE_NOSNIFF    = True
X_FRAME_OPTIONS                = 'DENY'

CSRF_TRUSTED_ORIGINS = [_FRONTEND, 'https://*.onrender.com']

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND              = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

# ─── Logging ──────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'verbose'},
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
    'loggers': {
        'django':         {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'django.request': {'handlers': ['console'], 'level': 'ERROR',   'propagate': False},
    },
}
