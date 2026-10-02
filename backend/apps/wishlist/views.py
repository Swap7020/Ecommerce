"""
AURA Cosmetics - Wishlist Views
"""
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return Response(WishlistSerializer(wishlist, context={'request': request}).data)


class WishlistToggleView(APIView):
    """
    POST /api/wishlist/{product_id}/
    Adds the product if not present, removes if already in wishlist (toggle).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        if not created:
            item.delete()
            return Response({'message': 'Removed from wishlist.', 'in_wishlist': False})

        return Response({'message': 'Added to wishlist.', 'in_wishlist': True}, status=status.HTTP_201_CREATED)


class WishlistCheckView(APIView):
    """GET /api/wishlist/check/?product_ids=1,2,3 — returns which product IDs are in wishlist."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ids_param = request.query_params.get('product_ids', '')
        if not ids_param:
            return Response({'wishlist_ids': []})
        try:
            ids = [int(i) for i in ids_param.split(',') if i.strip()]
        except ValueError:
            return Response({'error': 'Invalid product IDs.'}, status=status.HTTP_400_BAD_REQUEST)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        in_wishlist = list(
            WishlistItem.objects.filter(wishlist=wishlist, product_id__in=ids)
            .values_list('product_id', flat=True)
        )
        return Response({'wishlist_ids': in_wishlist})
