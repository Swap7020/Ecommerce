"""
AURA Cosmetics - Products URL Configuration
/api/products/...
"""
from django.urls import path
from .views import (
    ProductListView, ProductDetailView,
    FeaturedProductsView, BestSellersView, NewArrivalsView,
    SearchSuggestionsView,
    BrandListView, BrandDetailView,
    HomepageBannerListView, PromotionalBannerListView,
    HomepageDataView,
)

urlpatterns = [
    # Products
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('best-sellers/', BestSellersView.as_view(), name='product-best-sellers'),
    path('new-arrivals/', NewArrivalsView.as_view(), name='product-new-arrivals'),
    path('search-suggestions/', SearchSuggestionsView.as_view(), name='product-search-suggestions'),

    # Homepage data
    path('homepage/', HomepageDataView.as_view(), name='homepage-data'),
    path('banners/', HomepageBannerListView.as_view(), name='homepage-banners'),
    path('promotional-banners/', PromotionalBannerListView.as_view(), name='promotional-banners'),

    # Brands
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('brands/<slug:slug>/', BrandDetailView.as_view(), name='brand-detail'),

    # Product detail — keep last to avoid clashing with named routes above
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
