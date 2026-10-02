"""
AURA Cosmetics - Cart Views
Supports authenticated users and guests (session-based).
"""
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer


def get_or_create_cart(request):
    """Return the cart for authenticated user or guest session."""
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart


class CartView(APIView):
    """GET — retrieve cart; DELETE — clear entire cart."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def delete(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class CartItemAddView(APIView):
    """POST — add a product to cart (or increment quantity)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = data['product_id']
        variant = data.get('variant_id')
        quantity = data['quantity']

        # Stock check
        available_stock = variant.stock if variant else product.stock_quantity
        if available_stock < quantity:
            return Response(
                {'error': f'Only {available_stock} units available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = get_or_create_cart(request)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={
                'unit_price': product.effective_price,
                'quantity': quantity,
            }
        )
        if not created:
            new_qty = item.quantity + quantity
            if new_qty > available_stock:
                return Response(
                    {'error': f'Cannot add more. Max available: {available_stock}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = new_qty
            item.save(update_fields=['quantity'])

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_200_OK)


class CartItemUpdateView(APIView):
    """PATCH — update quantity; DELETE — remove item."""
    permission_classes = [permissions.AllowAny]

    def _get_item(self, request, item_id):
        cart = get_or_create_cart(request)
        try:
            return CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return None

    def patch(self, request, item_id):
        item = self._get_item(request, item_id)
        if not item:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']

        available_stock = item.variant.stock if item.variant else item.product.stock_quantity
        if quantity > available_stock:
            return Response(
                {'error': f'Only {available_stock} units available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.quantity = quantity
        item.save(update_fields=['quantity'])

        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request, item_id):
        item = self._get_item(request, item_id)
        if not item:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={'request': request}).data)


class CartMergeView(APIView):
    """
    POST — merge guest cart into user cart after login.
    Called automatically on the frontend after successful login.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session_key = request.data.get('session_key')
        if not session_key:
            return Response({'message': 'No session cart to merge.'})

        try:
            guest_cart = Cart.objects.get(session_key=session_key)
        except Cart.DoesNotExist:
            return Response({'message': 'No guest cart found.'})

        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        for guest_item in guest_cart.items.all():
            user_item, created = CartItem.objects.get_or_create(
                cart=user_cart,
                product=guest_item.product,
                variant=guest_item.variant,
                defaults={
                    'unit_price': guest_item.unit_price,
                    'quantity': guest_item.quantity,
                }
            )
            if not created:
                user_item.quantity += guest_item.quantity
                user_item.save(update_fields=['quantity'])

        guest_cart.delete()
        return Response(CartSerializer(user_cart, context={'request': request}).data)
