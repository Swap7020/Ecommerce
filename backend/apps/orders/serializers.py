"""
AURA Cosmetics - Orders Serializers
"""
from rest_framework import serializers
from apps.accounts.serializers import AddressSerializer
from apps.products.serializers import ProductListSerializer
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            'id', 'product', 'product_name', 'product_sku',
            'variant_name', 'product_image',
            'quantity', 'unit_price', 'total_price', 'is_returned'
        )


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ('status', 'note', 'created_at')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number',
            'shipping_full_name', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_pincode', 'shipping_country',
            'subtotal', 'discount_amount', 'coupon_code',
            'shipping_charge', 'tax_amount', 'total',
            'order_status', 'payment_status', 'payment_method',
            'estimated_delivery', 'actual_delivery',
            'tracking_number', 'courier',
            'customer_notes',
            'items', 'status_history',
            'created_at', 'updated_at',
        )
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """Validates the checkout request payload."""
    address_id = serializers.IntegerField(required=False)

    # Or provide address inline (guest checkout)
    full_name = serializers.CharField(required=False, max_length=200)
    phone = serializers.CharField(required=False, max_length=15)
    address_line1 = serializers.CharField(required=False, max_length=255)
    address_line2 = serializers.CharField(required=False, max_length=255, allow_blank=True)
    landmark = serializers.CharField(required=False, max_length=255, allow_blank=True)
    city = serializers.CharField(required=False, max_length=100)
    state = serializers.CharField(required=False, max_length=100)
    pincode = serializers.CharField(required=False, max_length=10)
    country = serializers.CharField(required=False, max_length=100, default='India')

    payment_method = serializers.ChoiceField(choices=['razorpay', 'stripe', 'cod'])
    coupon_code = serializers.CharField(required=False, allow_blank=True, max_length=50)
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    guest_email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('address_id'):
            required_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: f'{field} is required when no address_id is provided.'})
        return attrs
