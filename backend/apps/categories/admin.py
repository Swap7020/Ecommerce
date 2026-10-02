from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Concern


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('icon_name', 'slug', 'parent', 'product_count_badge', 'is_active', 'display_order')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order', 'name')
    list_editable = ('is_active', 'display_order')

    def icon_name(self, obj):
        return format_html(
            '<span style="font-size:20px;">{}</span> <strong>{}</strong>',
            obj.icon or '📦', obj.name
        )
    icon_name.short_description = 'Category'

    def product_count_badge(self, obj):
        count = obj.product_count
        return format_html(
            '<span style="background:#F5EAD2;color:#8A6242;padding:2px 8px;'
            'border-radius:12px;font-size:11px;font-weight:600;">{} products</span>',
            count
        )
    product_count_badge.short_description = 'Products'


@admin.register(Concern)
class ConcernAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active',)
