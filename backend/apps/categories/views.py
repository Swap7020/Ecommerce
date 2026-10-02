"""
AURA Cosmetics - Categories Views
"""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Concern
from .serializers import CategorySerializer, CategoryMinimalSerializer, ConcernSerializer


class CategoryListView(generics.ListAPIView):
    """List all active top-level categories with their children."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Category.objects.filter(is_active=True, parent__isnull=True).prefetch_related('children')
        return qs


class CategoryDetailView(generics.RetrieveAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = Category.objects.filter(is_active=True)


class ConcernListView(generics.ListAPIView):
    serializer_class = ConcernSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Concern.objects.filter(is_active=True)
