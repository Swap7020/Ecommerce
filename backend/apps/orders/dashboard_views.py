"""
AURA Cosmetics - Admin Dashboard API
Provides KPI and chart data for the admin dashboard.
"""
from datetime import timedelta
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.products.models import Product
from .models import Order, OrderItem


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class DashboardKPIView(APIView):
    """GET /api/orders/dashboard/kpi/ — summary stats for admin."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        # Revenue
        total_revenue = Order.objects.filter(
            payment_status='paid'
        ).aggregate(total=Sum('total'))['total'] or 0

        monthly_revenue = Order.objects.filter(
            payment_status='paid', created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('total'))['total'] or 0

        # Orders
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(order_status='pending').count()
        recent_orders = Order.objects.filter(created_at__gte=seven_days_ago).count()

        # Customers
        total_customers = User.objects.filter(is_staff=False).count()
        new_customers = User.objects.filter(
            is_staff=False, date_joined__gte=thirty_days_ago
        ).count()

        # Products
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_products = Product.objects.filter(
            is_active=True, stock_quantity__lte=5, stock_quantity__gt=0
        ).count()
        out_of_stock = Product.objects.filter(is_active=True, stock_quantity=0).count()

        # Average order value
        aov = Order.objects.filter(payment_status='paid').aggregate(avg=Avg('total'))['avg'] or 0

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(monthly_revenue),
            },
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
                'recent_7_days': recent_orders,
            },
            'customers': {
                'total': total_customers,
                'new_30_days': new_customers,
            },
            'products': {
                'total': total_products,
                'low_stock': low_stock_products,
                'out_of_stock': out_of_stock,
            },
            'average_order_value': float(aov),
        })


class DashboardRevenueChartView(APIView):
    """GET /api/orders/dashboard/revenue-chart/?days=30"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)

        data = (
            Order.objects
            .filter(payment_status='paid', created_at__gte=since)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('date')
        )
        return Response({'data': list(data)})


class DashboardTopProductsView(APIView):
    """GET /api/orders/dashboard/top-products/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (
            OrderItem.objects
            .filter(order__payment_status='paid')
            .values('product_name', 'product__slug')
            .annotate(total_sold=Sum('quantity'), revenue=Sum('total_price'))
            .order_by('-total_sold')[:10]
        )
        return Response({'data': list(data)})


class DashboardRecentOrdersView(APIView):
    """GET /api/orders/dashboard/recent-orders/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .serializers import OrderSerializer
        orders = (
            Order.objects
            .prefetch_related('items')
            .order_by('-created_at')[:10]
        )
        serializer = OrderSerializer(orders, many=True)
        return Response({'data': serializer.data})


class DashboardLowStockView(APIView):
    """GET /api/orders/dashboard/low-stock/"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.products.serializers import ProductListSerializer
        products = Product.objects.filter(
            is_active=True, stock_quantity__lte=10
        ).order_by('stock_quantity')[:20]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'data': serializer.data})
