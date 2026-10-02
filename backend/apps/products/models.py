"""
AURA Cosmetics - Products Models
"""
from decimal import Decimal
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.categories.models import Category, Concern


class Brand(models.Model):
    """Product brand."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """Core product model."""
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True, db_index=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name='products'
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products'
    )
    concerns = models.ManyToManyField(Concern, blank=True, related_name='products')

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    mrp = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))],
        help_text='Maximum Retail Price'
    )
    discount_percent = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(100)]
    )

    # Content
    short_description = models.TextField(blank=True, max_length=500)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    how_to_use = models.TextField(blank=True)

    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)

    # Attributes
    weight = models.CharField(max_length=50, blank=True, help_text='e.g., 30ml, 50g')
    dimensions = models.CharField(max_length=100, blank=True)
    shelf_life = models.CharField(max_length=100, blank=True)

    # Ratings (cached/computed)
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=Decimal('0.0'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('5'))]
    )
    review_count = models.PositiveIntegerField(default=0)

    # Flags
    is_featured = models.BooleanField(default=False, db_index=True)
    is_new_arrival = models.BooleanField(default=False, db_index=True)
    is_best_seller = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_taxable = models.BooleanField(default=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text='Comma-separated tags')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active', 'is_featured']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['brand', 'is_active']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        if not self.sku:
            self.sku = f'AURA-{self.name[:4].upper()}-{Product.objects.count() + 1:04d}'
        super().save(*args, **kwargs)

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= self.low_stock_threshold

    @property
    def effective_price(self):
        """Returns selling price — uses stored price field as source of truth."""
        return self.price

    @property
    def savings(self):
        return max(self.mrp - self.price, Decimal('0'))

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()


class ProductImage(models.Model):
    """Multiple images per product."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'display_order']

    def __str__(self):
        return f'Image for {self.product.name}'

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """Product variants (shade, size, etc.)."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    variant_type = models.CharField(max_length=50, help_text='e.g., Shade, Size, Volume')
    name = models.CharField(max_length=100, help_text='e.g., Ruby Red, 30ml')
    value = models.CharField(max_length=100, blank=True, help_text='e.g., hex code #CC0000')
    price_modifier = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.0,
        help_text='Price difference from base product price'
    )
    stock = models.PositiveIntegerField(default=0)
    sku_suffix = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['variant_type', 'name']

    def __str__(self):
        return f'{self.product.name} — {self.variant_type}: {self.name}'


class HomepageBanner(models.Model):
    """Admin-managed homepage hero banners."""
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='banners/')
    image_mobile = models.ImageField(upload_to='banners/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title


class PromotionalBanner(models.Model):
    """Mid-page promotional banners."""
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.CharField(max_length=255, blank=True)
    background_color = models.CharField(max_length=20, blank=True, default='#F5F0EB')
    image = models.ImageField(upload_to='promotions/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title
