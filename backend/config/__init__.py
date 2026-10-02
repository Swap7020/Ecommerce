# Only import Celery if it's installed (optional for local dev without Redis)
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    pass
