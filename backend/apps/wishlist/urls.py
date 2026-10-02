from django.urls import path
from .views import WishlistView, WishlistToggleView, WishlistCheckView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist'),
    path('check/', WishlistCheckView.as_view(), name='wishlist-check'),
    path('<int:product_id>/', WishlistToggleView.as_view(), name='wishlist-toggle'),
]
