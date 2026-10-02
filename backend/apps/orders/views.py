"""
AURA Cosmetics - Orders Views
"""
from decimal import Decimal
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from apps.cart.models import Cart, CartItem
from apps.accounts.models import Address
from apps.coupons.models import Coupon, CouponUsage
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, CheckoutSerializer

FREE_SHIPPING_THRESHOLD = Decimal('999.00')
STANDARD_SHIPPING_CHARGE = Decimal('79.00')
GST_RATE = Decimal('0.18')


def calculate_order_totals(subtotal, coupon=None, is_free_shipping_coupon=False):
    discount = Decimal('0.00')
    if coupon:
        discount = Decimal(str(coupon.calculate_discount(subtotal)))

    shipping = (
        Decimal('0.00')
        if (subtotal - discount) >= FREE_SHIPPING_THRESHOLD or is_free_shipping_coupon
        else STANDARD_SHIPPING_CHARGE
    )
    taxable_amount = subtotal - discount
    tax = (taxable_amount * GST_RATE).quantize(Decimal('0.01'))
    total = taxable_amount + shipping + tax
    return discount, shipping, tax, total


class CheckoutView(APIView):
    """
    POST /api/orders/checkout/
    Creates an Order from the user's cart.
    Returns order details + payment intent info for frontend.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # ── Get cart ─────────────────────────────────────────────────────────
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
            except Cart.DoesNotExist:
                return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            session_key = request.session.session_key
            if not session_key:
                return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                cart = Cart.objects.get(session_key=session_key)
            except Cart.DoesNotExist:
                return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product', 'variant').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Validate stock ────────────────────────────────────────────────────
        for item in cart_items:
            stock = item.variant.stock if item.variant else item.product.stock_quantity
            if item.quantity > stock:
                return Response(
                    {'error': f'"{item.product.name}" has insufficient stock.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ── Resolve shipping address ──────────────────────────────────────────
        addr_data = {}
        if data.get('address_id'):
            try:
                addr = Address.objects.get(pk=data['address_id'], user=request.user)
                addr_data = {
                    'shipping_full_name': addr.full_name,
                    'shipping_phone': addr.phone,
                    'shipping_address_line1': addr.address_line1,
                    'shipping_address_line2': addr.address_line2,
                    'shipping_city': addr.city,
                    'shipping_state': addr.state,
                    'shipping_pincode': addr.pincode,
                    'shipping_country': addr.country,
                    'shipping_address': addr,
                }
            except Address.DoesNotExist:
                return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            addr_data = {
                'shipping_full_name': data.get('full_name', ''),
                'shipping_phone': data.get('phone', ''),
                'shipping_address_line1': data.get('address_line1', ''),
                'shipping_address_line2': data.get('address_line2', ''),
                'shipping_city': data.get('city', ''),
                'shipping_state': data.get('state', ''),
                'shipping_pincode': data.get('pincode', ''),
                'shipping_country': data.get('country', 'India'),
            }

        # ── Coupon validation ─────────────────────────────────────────────────
        coupon = None
        coupon_code = data.get('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if not coupon.is_valid:
                    return Response({'error': 'Coupon is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
                if request.user.is_authenticated and coupon.is_first_order_only:
                    if Order.objects.filter(user=request.user, payment_status='paid').exists():
                        return Response({'error': 'This coupon is for first orders only.'}, status=status.HTTP_400_BAD_REQUEST)
                if request.user.is_authenticated:
                    user_uses = CouponUsage.objects.filter(coupon=coupon, user=request.user).count()
                    if user_uses >= coupon.usage_limit_per_user:
                        return Response({'error': 'You have already used this coupon.'}, status=status.HTTP_400_BAD_REQUEST)
            except Coupon.DoesNotExist:
                return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Calculate totals ──────────────────────────────────────────────────
        subtotal = cart.subtotal
        is_free_shipping = coupon and coupon.discount_type == 'free_shipping'
        discount, shipping, tax, total = calculate_order_totals(subtotal, coupon, is_free_shipping)

        # ── Create Order ──────────────────────────────────────────────────────
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            guest_email=data.get('guest_email', ''),
            subtotal=subtotal,
            discount_amount=discount,
            coupon_code=coupon_code,
            shipping_charge=shipping,
            tax_amount=tax,
            total=total,
            payment_method=data['payment_method'],
            payment_status='cod_pending' if data['payment_method'] == 'cod' else 'pending',
            customer_notes=data.get('customer_notes', ''),
            **addr_data,
        )

        # ── Create OrderItems + deduct stock ──────────────────────────────────
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                variant=item.variant,
                product_name=item.product.name,
                product_sku=item.product.sku,
                variant_name=item.variant.name if item.variant else '',
                product_image=(
                    item.product.primary_image.image.url
                    if item.product.primary_image and item.product.primary_image.image
                    else ''
                ),
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.line_total,
            )
            # Deduct stock
            if item.variant:
                item.variant.stock = max(0, item.variant.stock - item.quantity)
                item.variant.save(update_fields=['stock'])
            else:
                item.product.stock_quantity = max(0, item.product.stock_quantity - item.quantity)
                item.product.save(update_fields=['stock_quantity'])

        # Record coupon usage
        if coupon and request.user.is_authenticated:
            CouponUsage.objects.create(coupon=coupon, user=request.user, order=order)
            coupon.times_used += 1
            coupon.save(update_fields=['times_used'])

        OrderStatusHistory.objects.create(order=order, status='pending', note='Order placed.')

        # Clear cart
        cart.items.all().delete()

        response_data = OrderSerializer(order).data
        # Add payment initiation data for frontend
        response_data['payment_info'] = {
            'method': data['payment_method'],
            'order_id': str(order.id),
            'amount': str(total),
            'currency': 'INR',
        }
        return Response(response_data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.none()
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items', 'status_history')
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_history')


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        cancellable_statuses = ['pending', 'confirmed']
        if order.order_status not in cancellable_statuses:
            return Response(
                {'error': f'Cannot cancel an order with status "{order.order_status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.order_status = 'cancelled'
        order.save(update_fields=['order_status'])
        OrderStatusHistory.objects.create(
            order=order, status='cancelled',
            note='Cancelled by customer.', changed_by=request.user
        )
        # Restore stock
        for item in order.items.all():
            if item.variant:
                item.variant.stock += item.quantity
                item.variant.save(update_fields=['stock'])
            elif item.product:
                item.product.stock_quantity += item.quantity
                item.product.save(update_fields=['stock_quantity'])

        return Response(OrderSerializer(order).data)


class OrderSummaryView(APIView):
    """
    POST /api/orders/summary/
    Returns estimated totals for the current cart + optional coupon.
    Does NOT create an order.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apps.cart.models import Cart

        coupon_code = request.data.get('coupon_code', '').strip().upper()
        if request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
            except Cart.DoesNotExist:
                return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            session_key = request.session.session_key
            try:
                cart = Cart.objects.get(session_key=session_key)
            except (Cart.DoesNotExist, TypeError):
                return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.subtotal
        coupon = None
        coupon_error = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if not coupon.is_valid:
                    coupon_error = 'Coupon is invalid or expired.'
                    coupon = None
            except Coupon.DoesNotExist:
                coupon_error = 'Coupon not found.'

        is_free_shipping = coupon and coupon.discount_type == 'free_shipping'
        discount, shipping, tax, total = calculate_order_totals(subtotal, coupon, is_free_shipping)

        remaining_for_free_shipping = max(FREE_SHIPPING_THRESHOLD - subtotal, Decimal('0.00'))

        return Response({
            'subtotal': str(subtotal),
            'discount': str(discount),
            'shipping': str(shipping),
            'tax': str(tax),
            'total': str(total),
            'coupon_applied': coupon.code if coupon else None,
            'coupon_error': coupon_error,
            'free_shipping_threshold': str(FREE_SHIPPING_THRESHOLD),
            'remaining_for_free_shipping': str(remaining_for_free_shipping),
        })
