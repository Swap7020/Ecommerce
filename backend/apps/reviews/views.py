"""
AURA Cosmetics - Reviews Views
"""
from django.db.models import Avg, Count
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from .models import Review, ReviewHelpful
from .serializers import ReviewSerializer, ReviewWriteSerializer


class ProductReviewListView(generics.ListAPIView):
    """GET /api/reviews/?product={slug} — list approved reviews."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_slug = self.request.query_params.get('product')
        qs = Review.objects.filter(is_approved=True).select_related('user', 'user__profile')
        if product_slug:
            qs = qs.filter(product__slug=product_slug)
        return qs.order_by('-helpful_votes', '-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = ReviewSerializer(page or queryset, many=True, context={'request': request})
        data = serializer.data

        # Attach aggregate stats
        product_slug = request.query_params.get('product')
        stats = {}
        if product_slug:
            agg = queryset.aggregate(avg=Avg('rating'), count=Count('id'))
            distribution = {i: queryset.filter(rating=i).count() for i in range(1, 6)}
            stats = {
                'average_rating': round(agg['avg'] or 0, 1),
                'total_reviews': agg['count'],
                'distribution': distribution,
            }

        if page is not None:
            response = self.get_paginated_response(data)
            response.data['stats'] = stats
            return response
        return Response({'results': data, 'stats': stats})


class CreateReviewView(APIView):
    """POST /api/reviews/ — create a review (authenticated only)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_slug = request.data.get('product')
        try:
            product = Product.objects.get(slug=product_slug, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if Review.objects.filter(user=request.user, product=product).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check verified purchase
        is_verified = OrderItem.objects.filter(
            order__user=request.user,
            order__payment_status='paid',
            product=product
        ).exists()

        review = serializer.save(
            user=request.user,
            product=product,
            is_verified_purchase=is_verified,
            is_approved=False,  # Requires admin approval
        )
        return Response(ReviewSerializer(review, context={'request': request}).data, status=status.HTTP_201_CREATED)


class UpdateDeleteReviewView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewWriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)


class MarkReviewHelpfulView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id):
        try:
            review = Review.objects.get(pk=review_id, is_approved=True)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)

        _, created = ReviewHelpful.objects.get_or_create(review=review, user=request.user)
        if created:
            review.helpful_votes += 1
            review.save(update_fields=['helpful_votes'])
            return Response({'message': 'Marked as helpful.', 'helpful_votes': review.helpful_votes})
        return Response({'message': 'Already marked.'}, status=status.HTTP_400_BAD_REQUEST)
