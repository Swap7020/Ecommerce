"""
Custom Django admin site that injects dashboard stats into the index template.
"""
from datetime import timedelta
from decimal import Decimal

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.db.models import Sum, Count, Avg
from django.utils import timezone


class AuraAdminSite(AdminSite):
    site_header  = 'AURA Cosmetics'
    site_title   = 'AURA Admin'
    index_title  = 'Store Dashboard'

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}

        try:
            from apps.orders.models import Order
            from apps.accounts.models import User
            from apps.products.models import Product
            from apps.notifications.models import NewsletterSubscription

            now = timezone.now()
            thirty_ago = now - timedelta(days=30)

            # Revenue
            revenue_agg = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total'))
            total_rev = revenue_agg['total'] or Decimal('0')

            # Orders
            total_orders   = Order.objects.count()
            pending_orders = Order.objects.filter(order_status='pending').count()
            recent_orders  = (
                Order.objects
                .select_related('user')
                .order_by('-created_at')[:8]
            )

            # Customers
            total_customers = User.objects.filter(is_staff=False).count()
            new_customers   = User.objects.filter(is_staff=False, date_joined__gte=thirty_ago).count()

            # Products
            total_products     = Product.objects.filter(is_active=True).count()
            low_stock_products = (
                Product.objects
                .filter(is_active=True, stock_quantity__lte=10)
                .order_by('stock_quantity')[:8]
            )
            low_stock = low_stock_products.count()

            # AOV
            aov_agg = Order.objects.filter(payment_status='paid').aggregate(avg=Avg('total'))
            avg_aov = round(aov_agg['avg'] or 0, 0)

            # Newsletter
            newsletter_subs = NewsletterSubscription.objects.filter(is_active=True).count()

            extra_context.update({
                'total_revenue':    f'{int(total_rev):,}',
                'total_orders':     total_orders,
                'pending_orders':   pending_orders,
                'recent_orders':    recent_orders,
                'total_customers':  total_customers,
                'new_customers':    new_customers,
                'total_products':   total_products,
                'low_stock':        low_stock,
                'low_stock_products': low_stock_products,
                'avg_order_value':  f'{int(avg_aov):,}',
                'newsletter_subs':  newsletter_subs,
            })
        except Exception:
            pass  # Don't crash the admin if DB not ready

        return super().index(request, extra_context)


# Singleton instance that replaces the default admin site
aura_admin_site = AuraAdminSite(name='aura_admin')
