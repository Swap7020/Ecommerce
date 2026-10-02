"""
AURA Cosmetics - Cart Models
Supports both authenticated users and guest sessions.
"""
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product, ProductVariant


class Cart(models.Model):
    """Shopping cart — one per user (or session for guests)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='cart'
    )
    session_key = models.CharField(max_length=40, null=True, blank=True, unique=True)
    coupon_code = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(user__isnull=False) | models.Q(session_key__isnull=False)
                ),
                name='cart_must_have_user_or_session'
            )
        ]

    def __str__(self):
        owner = self.user.email if self.user else f'Session:{self.session_key}'
        return f'Cart — {owner}'

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())


class CartItem(models.Model):
    """Line item inside a cart."""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('cart', 'product', 'variant')]

    def __str__(self):
        return f'{self.quantity}x {self.product.name} in cart {self.cart.id}'

    @property
    def line_total(self):
        return self.unit_price * self.quantity
