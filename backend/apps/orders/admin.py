from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        'product', 'product_name', 'product_sku',
        'variant_name', 'quantity', 'unit_price', 'total_price'
    )
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('status', 'note', 'changed_by', 'created_at')
    can_delete = False
    ordering = ('-created_at',)

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer_info', 'items_count',
        'total_amount', 'order_status_badge', 'payment_status_badge',
        'payment_method', 'created_at'
    )
    list_filter = (
        'order_status', 'payment_status', 'payment_method',
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'order_number', 'user__email', 'guest_email',
        'shipping_full_name', 'shipping_phone', 'shipping_pincode'
    )
    readonly_fields = (
        'id', 'order_number', 'user', 'guest_email',
        'subtotal', 'discount_amount', 'coupon_code',
        'shipping_charge', 'tax_amount', 'total',
        'payment_method',
        'shipping_full_name', 'shipping_phone',
        'shipping_address_line1', 'shipping_address_line2',
        'shipping_city', 'shipping_state', 'shipping_pincode', 'shipping_country',
        'created_at', 'updated_at',
    )
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    list_per_page = 30
    date_hierarchy = 'created_at'
    save_on_top = True

    fieldsets = (
        ('Order Info', {
            'fields': (
                'id', 'order_number', 'user', 'guest_email',
                'order_status', 'payment_status', 'payment_method'
            )
        }),
        ('Shipping Address', {
            'fields': (
                'shipping_full_name', 'shipping_phone',
                'shipping_address_line1', 'shipping_address_line2',
                'shipping_city', 'shipping_state', 'shipping_pincode', 'shipping_country'
            )
        }),
        ('Financials', {
            'fields': (
                'subtotal', 'discount_amount', 'coupon_code',
                'shipping_charge', 'tax_amount', 'total'
            )
        }),
        ('Delivery', {
            'fields': ('estimated_delivery', 'actual_delivery', 'tracking_number', 'courier'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'mark_confirmed', 'mark_processing',
        'mark_shipped', 'mark_delivered', 'mark_cancelled'
    ]

    def customer_info(self, obj):
        if obj.user:
            return format_html(
                '<strong>{}</strong><br/>'
                '<span style="color:#6b7280;font-size:11px;">{}</span>',
                obj.shipping_full_name or obj.user.full_name,
                obj.user.email
            )
        return format_html(
            '<strong>{}</strong><br/>'
            '<span style="color:#6b7280;font-size:11px;">Guest: {}</span>',
            obj.shipping_full_name, obj.guest_email
        )
    customer_info.short_description = 'Customer'

    def items_count(self, obj):
        c = obj.items.count()
        return format_html('<span style="font-weight:600;">{}</span> item{}', c, 's' if c != 1 else '')
    items_count.short_description = 'Items'

    def total_amount(self, obj):
        return format_html('<strong style="font-size:14px;">₹{}</strong>', obj.total)
    total_amount.short_description = 'Total'

    ORDER_STATUS_COLORS = {
        'pending': '#d97706', 'confirmed': '#2563eb', 'processing': '#7c3aed',
        'shipped': '#0891b2', 'out_for_delivery': '#0284c7',
        'delivered': '#16a34a', 'cancelled': '#dc2626',
        'returned': '#6b7280', 'refunded': '#0d9488',
    }

    def order_status_badge(self, obj):
        color = self.ORDER_STATUS_COLORS.get(obj.order_status, '#6b7280')
        label = obj.get_order_status_display()
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;'
            'border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;">{}</span>',
            color, label
        )
    order_status_badge.short_description = 'Order Status'

    PAYMENT_STATUS_COLORS = {
        'paid': '#16a34a', 'pending': '#d97706',
        'failed': '#dc2626', 'refunded': '#0d9488',
        'cod_pending': '#7c3aed',
    }

    def payment_status_badge(self, obj):
        color = self.PAYMENT_STATUS_COLORS.get(obj.payment_status, '#6b7280')
        label = obj.get_payment_status_display()
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;'
            'border-radius:20px;font-size:11px;font-weight:600;">{}</span>',
            color, label
        )
    payment_status_badge.short_description = 'Payment'

    def mark_confirmed(self, req, qs):
        qs.update(order_status='confirmed')
        for o in qs:
            OrderStatusHistory.objects.create(order=o, status='confirmed', changed_by=req.user)
    mark_confirmed.short_description = '✓ Mark as Confirmed'

    def mark_processing(self, req, qs):
        qs.update(order_status='processing')
        for o in qs:
            OrderStatusHistory.objects.create(order=o, status='processing', changed_by=req.user)
    mark_processing.short_description = '⚙ Mark as Processing'

    def mark_shipped(self, req, qs):
        qs.update(order_status='shipped')
        for o in qs:
            OrderStatusHistory.objects.create(order=o, status='shipped', changed_by=req.user)
    mark_shipped.short_description = '🚚 Mark as Shipped'

    def mark_delivered(self, req, qs):
        qs.update(order_status='delivered', actual_delivery=timezone.now())
        for o in qs:
            OrderStatusHistory.objects.create(order=o, status='delivered', changed_by=req.user)
    mark_delivered.short_description = '✅ Mark as Delivered'

    def mark_cancelled(self, req, qs):
        qs.update(order_status='cancelled')
        for o in qs:
            OrderStatusHistory.objects.create(order=o, status='cancelled', changed_by=req.user)
    mark_cancelled.short_description = '✗ Mark as Cancelled'
