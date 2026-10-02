"""
AURA Cosmetics - Product Filters
"""
import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    brand = django_filters.CharFilter(field_name='brand__slug', lookup_expr='iexact')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_featured = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()
    is_best_seller = django_filters.BooleanFilter()

    class Meta:
        model = Product
        fields = ['category', 'brand', 'min_price', 'max_price', 'min_rating', 'in_stock']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_quantity__gt=0)
        return queryset.filter(stock_quantity=0)
