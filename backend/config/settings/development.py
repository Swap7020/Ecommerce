"""
AURA Cosmetics — Development Settings
Uses SQLite, console email, relaxed CORS.
"""
from .base import *   # noqa: F401, F403

DEBUG = True

# SQLite for local dev — no PostgreSQL needed
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True

# Dev email — prints to console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Show full tracebacks in API responses
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [  # noqa: F405
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# Disable rate limiting in dev
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []  # noqa: F405
