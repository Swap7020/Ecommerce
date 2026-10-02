"""
AURA Cosmetics - Coupons Views
"""
from decimal import Decimal
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon, CouponUsage


class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_amount = Decimal(str(request.data.get('order_amount', '0')))

        if not code:
            return Response({'error': 'Coupon code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid:
            return Response({'error': 'This coupon has expired or is no longer valid.'}, status=status.HTTP_400_BAD_REQUEST)

        if order_amount < coupon.minimum_order_amount:
            return Response({
                'error': f'Minimum order amount of ₹{coupon.minimum_order_amount} required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check per-user usage
        if request.user.is_authenticated:
            if coupon.is_first_order_only:
                from apps.orders.models import Order
                if Order.objects.filter(user=request.user, payment_status='paid').exists():
                    return Response({'error': 'This coupon is only valid on your first order.'}, status=status.HTTP_400_BAD_REQUEST)
            user_uses = CouponUsage.objects.filter(coupon=coupon, user=request.user).count()
            if user_uses >= coupon.usage_limit_per_user:
                return Response({'error': 'You have already used this coupon.'}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(order_amount)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'discount_amount': str(discount),
            'description': coupon.description,
            'free_shipping': coupon.discount_type == 'free_shipping',
        })
