from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count, Sum
from .models import Brand, Product, ProductImage, ProductVariant, HomepageBanner, PromotionalBanner


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_preview', 'image', 'alt_text', 'is_primary', 'display_order')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            try:
                return format_html(
                    '<img src="{}" style="height:60px;border-radius:6px;object-fit:cover;" />',
                    obj.image.url
                )
            except Exception:
                return '—'
        return '—'
    image_preview.short_description = 'Preview'


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('variant_type', 'name', 'value', 'price_modifier', 'stock', 'is_active')


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'is_active', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active',)

    def product_count(self, obj):
        return obj.products.filter(is_active=True).count()
    product_count.short_description = 'Active Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'thumbnail', 'name', 'category', 'brand',
        'price', 'mrp', 'discount_badge',
        'stock_status', 'rating_stars',
        'is_featured', 'is_best_seller', 'is_new_arrival', 'is_active'
    )
    list_display_links = ('thumbnail', 'name')
    list_filter = (
        'is_active', 'is_featured', 'is_new_arrival', 'is_best_seller',
        'category', 'brand'
    )
    search_fields = ('name', 'sku', 'tags', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('slug', 'sku', 'rating', 'review_count', 'created_at', 'updated_at')
    inlines = [ProductImageInline, ProductVariantInline]
    list_editable = ('is_featured', 'is_best_seller', 'is_new_arrival', 'is_active')
    list_per_page = 25
    save_on_top = True

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'sku', 'category', 'brand', 'concerns')
        }),
        ('Pricing', {
            'fields': ('price', 'mrp', 'discount_percent'),
            'description': 'Set price = selling price, MRP = original price before discount'
        }),
        ('Content', {
            'fields': ('short_description', 'description', 'ingredients', 'benefits', 'how_to_use'),
            'classes': ('collapse',)
        }),
        ('Inventory & Details', {
            'fields': ('stock_quantity', 'low_stock_threshold', 'weight', 'dimensions', 'shelf_life')
        }),
        ('Visibility Flags', {
            'fields': ('is_featured', 'is_new_arrival', 'is_best_seller', 'is_active')
        }),
        ('Tax', {
            'fields': ('is_taxable', 'tax_rate'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'tags'),
            'classes': ('collapse',)
        }),
        ('Stats (read-only)', {
            'fields': ('rating', 'review_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['make_active', 'make_inactive', 'make_featured', 'remove_featured',
               'mark_bestseller', 'mark_new_arrival']

    def thumbnail(self, obj):
        img = obj.primary_image
        if img and img.image:
            try:
                return format_html(
                    '<img src="{}" style="width:40px;height:50px;object-fit:cover;'
                    'border-radius:6px;" />',
                    img.image.url
                )
            except Exception:
                pass
        return format_html(
            '<div style="width:40px;height:50px;background:#F5EAD2;border-radius:6px;'
            'display:flex;align-items:center;justify-content:center;font-size:18px;">💄</div>'
        )
    thumbnail.short_description = ''

    def discount_badge(self, obj):
        if obj.discount_percent > 0:
            return format_html(
                '<span style="background:#16a34a;color:#fff;padding:2px 8px;'
                'border-radius:12px;font-size:11px;font-weight:600;">-{}%</span>',
                obj.discount_percent
            )
        return '—'
    discount_badge.short_description = 'Discount'

    def stock_status(self, obj):
        if obj.stock_quantity == 0:
            color, label = '#dc2626', 'Out of Stock'
        elif obj.stock_quantity <= 5:
            color, label = '#d97706', f'Low ({obj.stock_quantity})'
        else:
            color, label = '#16a34a', f'In Stock ({obj.stock_quantity})'
        return format_html(
            '<span style="color:{};font-weight:600;font-size:12px;">{}</span>',
            color, label
        )
    stock_status.short_description = 'Stock'

    def rating_stars(self, obj):
        if not obj.rating:
            return '—'
        stars = '★' * int(obj.rating) + '☆' * (5 - int(obj.rating))
        return format_html(
            '<span style="color:#f59e0b;" title="{} stars">{}</span> '
            '<span style="color:#9ca3af;font-size:11px;">({})</span>',
            obj.rating, stars, obj.review_count
        )
    rating_stars.short_description = 'Rating'

    # Bulk actions
    def make_active(self, req, qs): qs.update(is_active=True)
    make_active.short_description = 'Activate selected products'

    def make_inactive(self, req, qs): qs.update(is_active=False)
    make_inactive.short_description = 'Deactivate selected products'

    def make_featured(self, req, qs): qs.update(is_featured=True)
    make_featured.short_description = 'Mark as Featured'

    def remove_featured(self, req, qs): qs.update(is_featured=False)
    remove_featured.short_description = 'Remove from Featured'

    def mark_bestseller(self, req, qs): qs.update(is_best_seller=True)
    mark_bestseller.short_description = 'Mark as Best Seller'

    def mark_new_arrival(self, req, qs): qs.update(is_new_arrival=True)
    mark_new_arrival.short_description = 'Mark as New Arrival'


@admin.register(HomepageBanner)
class HomepageBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'cta_text', 'is_active', 'display_order')
    list_editable = ('is_active', 'display_order')
    ordering = ('display_order',)


@admin.register(PromotionalBanner)
class PromotionalBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'cta_text', 'is_active', 'display_order')
    list_editable = ('is_active', 'display_order')
    ordering = ('display_order',)
