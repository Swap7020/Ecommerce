from django.contrib import admin
from django.utils.html import format_html
from .models import Payment, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ('amount', 'reason', 'status', 'created_at')
    can_delete = False


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'id_short', 'order_link', 'method_badge',
        'amount_display', 'status_badge', 'created_at'
    )
    list_filter = ('payment_method', 'status', 'currency')
    search_fields = (
        'gateway_order_id', 'gateway_payment_id',
        'order__order_number'
    )
    readonly_fields = (
        'id', 'order', 'payment_method', 'gateway_order_id',
        'gateway_payment_id', 'gateway_signature', 'amount',
        'currency', 'gateway_response', 'created_at', 'updated_at'
    )
    inlines = [RefundInline]

    def id_short(self, obj):
        return str(obj.id)[:8] + '...'
    id_short.short_description = 'ID'

    def order_link(self, obj):
        return format_html(
            '<a href="/admin/orders/order/{}/change/">#{}</a>',
            obj.order.pk, obj.order.order_number
        )
    order_link.short_description = 'Order'

    def method_badge(self, obj):
        icons = {'razorpay': '💳', 'stripe': '🌐', 'cod': '💵', 'upi': '📱'}
        icon = icons.get(obj.payment_method, '💰')
        return format_html('{} {}', icon, obj.get_payment_method_display())
    method_badge.short_description = 'Method'

    def amount_display(self, obj):
        return format_html('<strong>₹{}</strong>', obj.amount)
    amount_display.short_description = 'Amount'

    STATUS_COLORS = {
        'success': '#16a34a', 'pending': '#d97706',
        'failed': '#dc2626', 'refunded': '#0d9488',
        'initiated': '#6b7280',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:20px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
