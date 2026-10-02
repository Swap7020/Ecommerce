from django.urls import path
from .views import CheckoutView, OrderListView, OrderDetailView, CancelOrderView, OrderSummaryView
from .dashboard_views import (
    DashboardKPIView, DashboardRevenueChartView,
    DashboardTopProductsView, DashboardRecentOrdersView, DashboardLowStockView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('summary/', OrderSummaryView.as_view(), name='order-summary'),
    path('<uuid:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<uuid:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),

    # Admin dashboard
    path('dashboard/kpi/', DashboardKPIView.as_view(), name='dashboard-kpi'),
    path('dashboard/revenue-chart/', DashboardRevenueChartView.as_view(), name='dashboard-revenue-chart'),
    path('dashboard/top-products/', DashboardTopProductsView.as_view(), name='dashboard-top-products'),
    path('dashboard/recent-orders/', DashboardRecentOrdersView.as_view(), name='dashboard-recent-orders'),
    path('dashboard/low-stock/', DashboardLowStockView.as_view(), name='dashboard-low-stock'),
]
