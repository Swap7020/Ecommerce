from django.urls import path
from .views import CategoryListView, CategoryDetailView, ConcernListView

urlpatterns = [
    path('', CategoryListView.as_view(), name='category-list'),
    # concerns/ must come before the <slug> catch-all
    path('concerns/', ConcernListView.as_view(), name='concern-list'),
    path('<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
]
