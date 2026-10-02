from django.urls import path
from .views import InitiatePaymentView, VerifyPaymentView, StripeWebhookView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
