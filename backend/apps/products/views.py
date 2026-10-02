"""
AURA Cosmetics - Products Views
"""
from django.db.models import Q
from django.core.cache import cache
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from .models import Brand, Product, HomepageBanner, PromotionalBanner
from .serializers import (
    BrandSerializer, ProductListSerializer, ProductDetailSerializer,
    ProductWriteSerializer, HomepageBannerSerializer, PromotionalBannerSerializer
)
from .filters import ProductFilter


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 60


# ─── Products ─────────────────────────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Supports filtering, searching, ordering and pagination.
    ?category=makeup&brand=aura&min_price=100&max_price=1000
    ?search=lipstick&ordering=-rating&in_stock=true
    """
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'tags', 'sku', 'brand__name', 'category__name']
    ordering_fields = ['price', 'rating', 'created_at', 'review_count', 'name', 'discount_percent']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand')
            .prefetch_related('images')
        )


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/{slug}/"""
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand')
            .prefetch_related('images', 'variants', 'concerns')
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Related products (same category, exclude self)
        related = (
            Product.objects
            .filter(category=instance.category, is_active=True)
            .exclude(pk=instance.pk)
            .prefetch_related('images')[:6]
        )
        data['related_products'] = ProductListSerializer(
            related, many=True, context={'request': request}
        ).data
        return Response(data)


class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True).prefetch_related('images')[:12]


class BestSellersView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True, is_best_seller=True)
            .prefetch_related('images')
            .order_by('-rating', '-review_count')[:12]
        )


class NewArrivalsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True, is_new_arrival=True)
            .prefetch_related('images')
            .order_by('-created_at')[:12]
        )


class SearchSuggestionsView(APIView):
    """
    GET /api/products/search-suggestions/?q=lip
    Returns fast lightweight search suggestions.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response({'suggestions': []})

        cache_key = f'search_suggestions_{q}'
        cached = cache.get(cache_key)
        if cached:
            return Response({'suggestions': cached})

        products = (
            Product.objects
            .filter(is_active=True, name__icontains=q)
            .values('name', 'slug', 'price')[:8]
        )
        suggestions = list(products)
        cache.set(cache_key, suggestions, timeout=300)
        return Response({'suggestions': suggestions})


# ─── Brands ───────────────────────────────────────────────────────────────────

class BrandListView(generics.ListAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Brand.objects.filter(is_active=True)


class BrandDetailView(generics.RetrieveAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = Brand.objects.filter(is_active=True)


# ─── Homepage Content ─────────────────────────────────────────────────────────

class HomepageBannerListView(generics.ListAPIView):
    serializer_class = HomepageBannerSerializer
    permission_classes = [permissions.AllowAny]
    queryset = HomepageBanner.objects.filter(is_active=True)


class PromotionalBannerListView(generics.ListAPIView):
    serializer_class = PromotionalBannerSerializer
    permission_classes = [permissions.AllowAny]
    queryset = PromotionalBanner.objects.filter(is_active=True)


class HomepageDataView(APIView):
    """
    GET /api/products/homepage/
    Returns all homepage data in a single request.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cache_key = 'homepage_data'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        ctx = {'request': request}

        banners = HomepageBanner.objects.filter(is_active=True)
        promo_banners = PromotionalBanner.objects.filter(is_active=True)
        best_sellers = (
            Product.objects.filter(is_active=True, is_best_seller=True)
            .prefetch_related('images').order_by('-rating')[:8]
        )
        new_arrivals = (
            Product.objects.filter(is_active=True, is_new_arrival=True)
            .prefetch_related('images').order_by('-created_at')[:8]
        )
        featured = (
            Product.objects.filter(is_active=True, is_featured=True)
            .prefetch_related('images')[:8]
        )

        data = {
            'banners': HomepageBannerSerializer(banners, many=True, context=ctx).data,
            'promotional_banners': PromotionalBannerSerializer(promo_banners, many=True, context=ctx).data,
            'best_sellers': ProductListSerializer(best_sellers, many=True, context=ctx).data,
            'new_arrivals': ProductListSerializer(new_arrivals, many=True, context=ctx).data,
            'featured_products': ProductListSerializer(featured, many=True, context=ctx).data,
        }
        cache.set(cache_key, data, timeout=600)
        return Response(data)
