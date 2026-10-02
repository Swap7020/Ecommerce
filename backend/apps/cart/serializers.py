"""
AURA Cosmetics - Cart Serializers
"""
from rest_framework import serializers
from apps.products.serializers import ProductListSerializer
from apps.products.models import Product, ProductVariant
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), write_only=True, source='product'
    )
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True),
        write_only=True, source='variant', required=False, allow_null=True
    )
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = (
            'id', 'product', 'product_id', 'variant_id',
            'quantity', 'unit_price', 'line_total', 'added_at'
        )
        read_only_fields = ('id', 'unit_price', 'added_at')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'items', 'subtotal', 'total_items', 'coupon_code', 'updated_at')
        read_only_fields = ('id', 'updated_at')


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True),
        required=False, allow_null=True
    )
    quantity = serializers.IntegerField(min_value=1, max_value=20, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=20)