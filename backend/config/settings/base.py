"""
AURA Cosmetics — Base Settings
Shared by development and production.
"""
from datetime import timedelta
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent.parent   # backend/

# ─── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY   = config('SECRET_KEY', default='django-insecure-replace-me')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ─── Application definition ───────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
]

LOCAL_APPS = [
    'apps.accounts',
    'apps.products',
    'apps.categories',
    'apps.cart',
    'apps.wishlist',
    'apps.orders',
    'apps.payments',
    'apps.reviews',
    'apps.coupons',
    'apps.notifications',
]

# Optional apps (installed only when the package is present)
_OPTIONAL = []
try:
    import django_extensions; _OPTIONAL.append('django_extensions')  # noqa
except ImportError:
    pass

_CLOUDINARY_NAME = config('CLOUDINARY_CLOUD_NAME', default='')
try:
    import cloudinary  # noqa
    if _CLOUDINARY_NAME:
        _OPTIONAL += ['cloudinary', 'cloudinary_storage']
except ImportError:
    pass

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS + _OPTIONAL
SITE_ID = 1

# ─── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF       = 'config.urls'
WSGI_APPLICATION   = 'config.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL    = 'accounts.User'

# ─── Templates ────────────────────────────────────────────────────────────────
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Kolkata'
USE_I18N = USE_TZ = True

# ─── Static & Media ───────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

STORAGES = {
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
    'default':     {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
}

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary for production media
if _CLOUDINARY_NAME:
    STORAGES['default'] = {'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage'}
    try:
        import cloudinary
        cloudinary.config(
            cloud_name=_CLOUDINARY_NAME,
            api_key=config('CLOUDINARY_API_KEY', default=''),
            api_secret=config('CLOUDINARY_API_SECRET', default=''),
            secure=True,
        )
    except ImportError:
        pass

# ─── Auth & Password ──────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# ─── Allauth ──────────────────────────────────────────────────────────────────
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED        = True
ACCOUNT_UNIQUE_EMAIL          = True
ACCOUNT_USERNAME_REQUIRED     = False
ACCOUNT_EMAIL_VERIFICATION    = 'none'   # override to 'mandatory' in production
SOCIALACCOUNT_PROVIDERS       = {}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization',
    'content-type', 'dnt', 'origin',
    'user-agent', 'x-csrftoken', 'x-requested-with',
]
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')

# ─── REST Framework ───────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {'anon': '200/day', 'user': '2000/day'},
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME_MINUTES',  default=60,  cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7,   cast=int)),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN':      True,
    'ALGORITHM':              'HS256',
    'SIGNING_KEY':            SECRET_KEY,
    'AUTH_HEADER_TYPES':      ('Bearer',),
    'AUTH_TOKEN_CLASSES':     ('rest_framework_simplejwt.tokens.AccessToken',),
}

# ─── API Docs ─────────────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE':       'AURA Cosmetics API',
    'DESCRIPTION': 'REST API for AURA Cosmetics e-commerce platform.',
    'VERSION':     '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'CONTACT':     {'email': 'dev@auracosmetics.com'},
    'LICENSE':     {'name': 'Proprietary'},
    'DISABLE_ERRORS_AND_WARNINGS': True,
    # Silence schema generation noise
    'SCHEMA_COERCE_PATH_PK_SUFFIX': True,
    'POSTPROCESSING_HOOKS': [],
}

# ─── Cache — graceful Redis fallback ──────────────────────────────────────────
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')

try:
    import redis as _r_test
    _r_test.from_url(REDIS_URL, socket_connect_timeout=1).ping()
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'TIMEOUT': 300,
        }
    }
    SESSION_ENGINE     = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'default'
except Exception:
    CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache', 'LOCATION': 'aura'}}

# ─── Celery ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL        = config('CELERY_BROKER_URL',    default=REDIS_URL)
CELERY_RESULT_BACKEND    = config('CELERY_RESULT_BACKEND', default=REDIS_URL)
CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE          = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND     = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST        = config('EMAIL_HOST',    default='')
EMAIL_PORT        = config('EMAIL_PORT',    default=587, cast=int)
EMAIL_USE_TLS     = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER   = config('EMAIL_HOST_USER',     default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL  = config('DEFAULT_FROM_EMAIL',  default='noreply@auracosmetics.com')

# ─── Payments ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID      = config('RAZORPAY_KEY_ID',      default='')
RAZORPAY_KEY_SECRET  = config('RAZORPAY_KEY_SECRET',  default='')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY      = config('STRIPE_SECRET_KEY',      default='')
STRIPE_WEBHOOK_SECRET  = config('STRIPE_WEBHOOK_SECRET',  default='')

# ─── Analytics ────────────────────────────────────────────────────────────────
GOOGLE_ANALYTICS_ID    = config('GOOGLE_ANALYTICS_ID',    default='')
META_PIXEL_ID          = config('META_PIXEL_ID',          default='')
GOOGLE_TAG_MANAGER_ID  = config('GOOGLE_TAG_MANAGER_ID',  default='')

# ─── Silence schema-only warnings (don't affect runtime) ─────────────────────
SILENCED_SYSTEM_CHECKS = [
    'drf_spectacular.W001',
    'drf_spectacular.W002',
]
