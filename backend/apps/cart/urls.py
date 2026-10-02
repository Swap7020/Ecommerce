from django.urls import path
from .views import CartView, CartItemAddView, CartItemUpdateView, CartMergeView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('items/', CartItemAddView.as_view(), name='cart-add-item'),
    path('items/<int:item_id>/', CartItemUpdateView.as_view(), name='cart-item-detail'),
    path('merge/', CartMergeView.as_view(), name='cart-merge'),
]
