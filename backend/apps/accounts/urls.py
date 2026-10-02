"""
AURA Cosmetics - Accounts URL Configuration
/api/auth/...
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView,
    VerifyEmailView, ResendVerificationView,
    ChangePasswordView, ForgotPasswordView, ResetPasswordView,
    ProfileView, AddressListCreateView, AddressDetailView, SetDefaultAddressView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),

    # Email verification
    path('verify-email/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='auth-resend-verification'),

    # Password
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),

    # Profile
    path('profile/', ProfileView.as_view(), name='auth-profile'),

    # Addresses
    path('addresses/', AddressListCreateView.as_view(), name='auth-addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='auth-address-detail'),
    path('addresses/<int:pk>/set-default/', SetDefaultAddressView.as_view(), name='auth-address-set-default'),
]
