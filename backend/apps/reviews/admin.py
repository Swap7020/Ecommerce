from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count
from .models import Review, ReviewImage


class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 0
    readonly_fields = ('image_preview',)
    fields = ('image_preview', 'image', 'alt_text')

    def image_preview(self, obj):
        if obj.image:
            try:
                return format_html('<img src="{}" style="height:50px;border-radius:4px;" />', obj.image.url)
            except Exception:
                return '—'
        return '—'
    image_preview.short_description = 'Preview'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'star_rating', 'product_link', 'user_info',
        'title_preview', 'is_approved', 'is_verified_purchase',
        'helpful_votes', 'created_at'
    )
    list_filter = ('is_approved', 'rating', 'is_verified_purchase')
    search_fields = ('user__email', 'product__name', 'title', 'comment')
    readonly_fields = ('user', 'product', 'rating', 'helpful_votes', 'created_at', 'updated_at')
    list_editable = ('is_approved',)
    inlines = [ReviewImageInline]
    date_hierarchy = 'created_at'
    list_per_page = 30
    actions = ['approve_reviews', 'reject_reviews']

    fieldsets = (
        ('Review', {'fields': ('user', 'product', 'rating', 'title', 'comment')}),
        ('Moderation', {'fields': ('is_approved', 'rejection_reason', 'reviewed_by')}),
        ('Stats', {'fields': ('is_verified_purchase', 'helpful_votes', 'created_at', 'updated_at')}),
    )

    def star_rating(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="color:#f59e0b;font-size:16px;">{}</span>', stars)
    star_rating.short_description = 'Rating'

    def product_link(self, obj):
        return format_html(
            '<a href="/admin/products/product/{}/change/">{}</a>',
            obj.product.pk, obj.product.name[:35]
        )
    product_link.short_description = 'Product'

    def user_info(self, obj):
        return format_html(
            '<span style="font-size:12px;">{}</span>', obj.user.email
        )
    user_info.short_description = 'Customer'

    def title_preview(self, obj):
        text = obj.title or obj.comment[:50]
        return format_html('<span style="color:#374151;">{}</span>', text[:60])
    title_preview.short_description = 'Review'

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True, reviewed_by=request.user)
        for review in queryset:
            self._recalculate_rating(review.product)
        self.message_user(request, f'{queryset.count()} review(s) approved.')
    approve_reviews.short_description = '✓ Approve selected reviews'

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False, reviewed_by=request.user)
        self.message_user(request, f'{queryset.count()} review(s) rejected.')
    reject_reviews.short_description = '✗ Reject selected reviews'

    def _recalculate_rating(self, product):
        stats = Review.objects.filter(product=product, is_approved=True).aggregate(
            avg=Avg('rating'), count=Count('id')
        )
        from decimal import Decimal
        product.rating = Decimal(str(round(stats['avg'] or 0, 2)))
        product.review_count = stats['count']
        product.save(update_fields=['rating', 'review_count'])
