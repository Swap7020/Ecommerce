"""
AURA Cosmetics - Accounts Views
"""
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, CustomerProfile, Address, EmailVerificationToken, PasswordResetToken
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ProfileUpdateSerializer, AddressSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)


def send_verification_email(user, request=None):
    """Create a verification token and send the email."""
    expires_at = timezone.now() + timedelta(hours=24)
    token_obj = EmailVerificationToken.objects.create(user=user, expires_at=expires_at)
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{token_obj.token}"
    subject = 'Verify your AURA account email'
    message = (
        f'Hi {user.first_name or user.email},\n\n'
        f'Welcome to AURA! Please verify your email address by visiting:\n{verify_url}\n\n'
        f'This link expires in 24 hours.\n\nThe AURA Team'
    )
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    except Exception:
        pass  # Log in production; don't fail registration


def send_password_reset_email(user):
    """Create a reset token and send the email."""
    expires_at = timezone.now() + timedelta(hours=2)
    # Invalidate any existing tokens
    PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
    token_obj = PasswordResetToken.objects.create(user=user, expires_at=expires_at)
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token_obj.token}"
    subject = 'Reset your AURA password'
    message = (
        f'Hi {user.first_name or user.email},\n\n'
        f'We received a request to reset your password. Click the link below:\n{reset_url}\n\n'
        f'This link expires in 2 hours. If you did not request this, ignore this email.\n\nThe AURA Team'
    )
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    except Exception:
        pass


# ─── Register ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_email(user, request)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Account created successfully. Please verify your email.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response({
            'access': data['access'],
            'refresh': data['refresh'],
            'user': UserSerializer(data['user']).data,
        })


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        return Response({'message': 'Logged out successfully.'})


# ─── Email Verification ───────────────────────────────────────────────────────

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_value = request.data.get('token')
        if not token_value:
            return Response({'error': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token_obj = EmailVerificationToken.objects.get(
                token=token_value,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid or expired verification token.'}, status=status.HTTP_400_BAD_REQUEST)

        token_obj.user.is_email_verified = True
        token_obj.user.save(update_fields=['is_email_verified'])
        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])
        return Response({'message': 'Email verified successfully.'})


class ResendVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_email_verified:
            return Response({'message': 'Email is already verified.'})
        send_verification_email(request.user, request)
        return Response({'message': 'Verification email sent.'})


# ─── Password ─────────────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response({'message': 'Password changed successfully.'})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            send_password_reset_email(user)
        except User.DoesNotExist:
            pass  # Don't reveal whether email exists
        return Response({
            'message': 'If that email is registered, you will receive a reset link shortly.'
        })


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_obj = serializer.validated_data['token_obj']
        token_obj.user.set_password(serializer.validated_data['new_password'])
        token_obj.user.save(update_fields=['password'])
        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])
        return Response({'message': 'Password reset successfully. You can now log in.'})


# ─── Profile ──────────────────────────────────────────────────────────────────

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
        serializer = ProfileUpdateSerializer(
            profile, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


# ─── Addresses ────────────────────────────────────────────────────────────────

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # If deleting default, promote the next address
        was_default = instance.is_default
        instance.delete()
        if was_default:
            next_addr = Address.objects.filter(user=self.request.user).first()
            if next_addr:
                next_addr.is_default = True
                next_addr.save(update_fields=['is_default'])


class SetDefaultAddressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        address.is_default = True
        address.save(update_fields=['is_default'])
        return Response(AddressSerializer(address).data)
