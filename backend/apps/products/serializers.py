"""
AURA Cosmetics - Products Serializers
"""
from rest_framework import serializers
from .models import Brand, Product, ProductImage, ProductVariant, HomepageBanner, PromotionalBanner
from apps.categories.serializers import CategoryMinimalSerializer


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'description', 'logo', 'website', 'is_active')


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'display_order')


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'variant_type', 'name', 'value', 'price_modifier', 'stock', 'sku_suffix', 'is_active')


class ProductListSerializer(serializers.ModelSerializer):
    """Compact serializer for product grid/list views."""
    primary_image = serializers.SerializerMethodField()
    category = CategoryMinimalSerializer(read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'category', 'brand_name',
            'price', 'mrp', 'discount_percent', 'effective_price', 'savings',
            'rating', 'review_count', 'primary_image',
            'is_featured', 'is_new_arrival', 'is_best_seller',
            'is_in_stock', 'weight', 'short_description',
        )

    def get_primary_image(self, obj):
        img = obj.primary_image
        if img:
            request = self.context.get('request')
            url = img.image.url if img.image else None
            return {
                'url': request.build_absolute_uri(url) if request and url else url,
                'alt': img.alt_text or obj.name,
            }
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail page."""
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategoryMinimalSerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'category', 'brand',
            'price', 'mrp', 'discount_percent', 'effective_price', 'savings',
            'short_description', 'description', 'ingredients', 'benefits', 'how_to_use',
            'stock_quantity', 'is_in_stock', 'is_low_stock',
            'weight', 'dimensions', 'shelf_life',
            'rating', 'review_count',
            'is_featured', 'is_new_arrival', 'is_best_seller',
            'is_taxable', 'tax_rate',
            'images', 'variants',
            'meta_title', 'meta_description', 'tags',
            'created_at', 'updated_at',
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    """Serializer for create/update (admin use)."""
    class Meta:
        model = Product
        exclude = ('slug', 'sku', 'rating', 'review_count', 'created_at', 'updated_at')


class HomepageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageBanner
        fields = ('id', 'title', 'subtitle', 'cta_text', 'cta_link', 'image', 'image_mobile', 'display_order')


class PromotionalBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalBanner
        fields = ('id', 'title', 'subtitle', 'cta_text', 'cta_link', 'background_color', 'image', 'display_order')
