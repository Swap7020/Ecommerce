"""
AURA Cosmetics - Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from apps.orders.admin_views import aura_admin_site

# ── Register all apps into the custom admin site ─────────────────────────────
# This mirrors whatever is registered in the default admin
def _register_all():
    """Copy default admin registrations to our custom site."""
    from django.contrib.admin import site as default_site
    for model, model_admin in default_site._registry.items():
        try:
            aura_admin_site.register(model, type(model_admin))
        except Exception:
            pass

# Customize default admin branding (used by allauth etc.)
admin.site.site_header = 'AURA Cosmetics Admin'
admin.site.site_title  = 'AURA Admin'
admin.site.index_title = 'Store Dashboard'

urlpatterns = [
    # Root → API docs
    path('', lambda request: redirect('/api/docs/', permanent=False)),

    # Admin — custom AURA dashboard
    path('admin/', admin.site.urls),

    # API v1
    path('api/auth/',          include('apps.accounts.urls')),
    path('api/products/',      include('apps.products.urls')),
    path('api/categories/',    include('apps.categories.urls')),
    path('api/cart/',          include('apps.cart.urls')),
    path('api/wishlist/',      include('apps.wishlist.urls')),
    path('api/orders/',        include('apps.orders.urls')),
    path('api/payments/',      include('apps.payments.urls')),
    path('api/reviews/',       include('apps.reviews.urls')),
    path('api/coupons/',       include('apps.coupons.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(),                      name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
