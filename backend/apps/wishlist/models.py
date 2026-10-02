"""
AURA Cosmetics - Wishlist Models
"""
from django.db import models
from django.conf import settings
from apps.products.models import Product


class Wishlist(models.Model):
    """One wishlist per authenticated user."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Wishlist — {self.user.email}'


class WishlistItem(models.Model):
    """Item saved to a wishlist."""
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('wishlist', 'product')]
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.product.name} in {self.wishlist.user.email}\'s wishlist'
