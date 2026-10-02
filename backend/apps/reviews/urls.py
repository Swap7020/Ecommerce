from django.urls import path
from .views import (
    ProductReviewListView, CreateReviewView,
    UpdateDeleteReviewView, MarkReviewHelpfulView
)

urlpatterns = [
    path('', ProductReviewListView.as_view(), name='review-list'),
    path('create/', CreateReviewView.as_view(), name='review-create'),
    path('<int:pk>/', UpdateDeleteReviewView.as_view(), name='review-detail'),
    path('<int:review_id>/helpful/', MarkReviewHelpfulView.as_view(), name='review-helpful'),
]
