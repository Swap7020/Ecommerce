from django.contrib import admin
from django.utils.html import format_html
from .models import Notification, NewsletterSubscription


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type_badge', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at',)

    def type_badge(self, obj):
        colors = {
            'order_confirmed': '#2563eb', 'order_shipped': '#0891b2',
            'order_delivered': '#16a34a', 'payment_success': '#16a34a',
            'promo': '#c4956a', 'system': '#6b7280',
        }
        color = colors.get(obj.notification_type, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:12px;font-size:11px;">{}</span>',
            color, obj.get_notification_type_display()
        )
    type_badge.short_description = 'Type'


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'status_badge', 'subscribed_at')
    list_filter = ('is_active',)
    search_fields = ('email',)
    readonly_fields = ('subscribed_at',)

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;'
                'border-radius:12px;font-size:11px;font-weight:600;">Subscribed</span>'
            )
        return format_html(
            '<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;'
            'border-radius:12px;font-size:11px;font-weight:600;">Unsubscribed</span>'
        )
    status_badge.short_description = 'Status'
