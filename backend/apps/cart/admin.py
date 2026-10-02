from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('unit_price', 'line_total', 'added_at')

    def line_total(self, obj):
        return obj.line_total
    line_total.short_description = 'Line Total'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'total_items', 'subtotal', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'session_key')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [CartItemInline]
