from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Coupon, CouponUsage


class CouponUsageInline(admin.TabularInline):
    model = CouponUsage
    extra = 0
    readonly_fields = ('user', 'order', 'used_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        'code_badge', 'discount_info', 'minimum_order_amount',
        'usage_progress', 'validity', 'status_badge'
    )
    list_filter = ('discount_type', 'is_active', 'is_first_order_only')
    search_fields = ('code', 'description')
    readonly_fields = ('times_used', 'created_at')
    inlines = [CouponUsageInline]

    fieldsets = (
        ('Coupon Details', {
            'fields': ('code', 'description', 'discount_type', 'discount_value', 'maximum_discount_amount')
        }),
        ('Conditions', {
            'fields': ('minimum_order_amount', 'is_first_order_only')
        }),
        ('Usage Limits', {
            'fields': ('usage_limit', 'usage_limit_per_user', 'times_used')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def code_badge(self, obj):
        return format_html(
            '<span style="font-family:monospace;background:#1a1a1a;color:#EDD8B4;'
            'padding:3px 10px;border-radius:6px;font-weight:700;letter-spacing:2px;">{}</span>',
            obj.code
        )
    code_badge.short_description = 'Code'

    def discount_info(self, obj):
        if obj.discount_type == 'percentage':
            return format_html('<strong>{}% off</strong>', obj.discount_value)
        elif obj.discount_type == 'fixed':
            return format_html('<strong>₹{} off</strong>', obj.discount_value)
        else:
            return format_html('<strong>Free Shipping</strong>')
    discount_info.short_description = 'Discount'

    def usage_progress(self, obj):
        if obj.usage_limit:
            pct = int((obj.times_used / obj.usage_limit) * 100)
            color = '#16a34a' if pct < 80 else '#dc2626'
            return format_html(
                '<div style="width:100px;background:#f3f4f6;border-radius:10px;height:8px;">'
                '<div style="width:{}%;background:{};border-radius:10px;height:8px;"></div>'
                '</div>'
                '<span style="font-size:11px;color:#6b7280;">{}/{}</span>',
                min(pct, 100), color, obj.times_used, obj.usage_limit
            )
        return format_html('<span style="color:#6b7280;">{} uses</span>', obj.times_used)
    usage_progress.short_description = 'Usage'

    def validity(self, obj):
        now = timezone.now()
        if obj.valid_until:
            if now > obj.valid_until:
                return format_html('<span style="color:#dc2626;">Expired</span>')
            days_left = (obj.valid_until - now).days
            color = '#16a34a' if days_left > 7 else '#d97706'
            return format_html(
                '<span style="color:{};">{} days left</span>', color, days_left
            )
        return format_html('<span style="color:#16a34a;">No expiry</span>')
    validity.short_description = 'Validity'

    def status_badge(self, obj):
        if obj.is_valid:
            return format_html(
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 10px;'
                'border-radius:20px;font-size:11px;font-weight:600;">Active</span>'
            )
        return format_html(
            '<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;'
            'border-radius:20px;font-size:11px;font-weight:600;">Inactive</span>'
        )
    status_badge.short_description = 'Status'


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'user', 'order', 'used_at')
    readonly_fields = ('coupon', 'user', 'order', 'used_at')
    list_filter = ('coupon',)
