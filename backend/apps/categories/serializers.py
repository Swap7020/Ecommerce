"""
AURA Cosmetics - Categories Serializers
"""
from rest_framework import serializers
from .models import Category, Concern


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'slug', 'description', 'image',
            'icon', 'parent', 'display_order', 'is_active',
            'meta_title', 'meta_description', 'product_count', 'children'
        )

    def get_product_count(self, obj):
        return obj.product_count

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True, context=self.context).data


class CategoryMinimalSerializer(serializers.ModelSerializer):
    """Lightweight serializer for nested use."""
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'image', 'icon')


class ConcernSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concern
        fields = ('id', 'name', 'slug', 'description', 'image', 'is_active')
