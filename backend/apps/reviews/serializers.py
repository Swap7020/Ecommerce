from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Review, ReviewImage


class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ('id', 'image', 'alt_text')


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 'user', 'rating', 'title', 'comment',
            'is_approved', 'is_verified_purchase',
            'helpful_votes', 'images', 'created_at'
        )
        read_only_fields = ('id', 'user', 'is_approved', 'is_verified_purchase', 'helpful_votes', 'created_at')


class ReviewWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('rating', 'title', 'comment')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
