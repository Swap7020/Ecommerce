"""
AURA Cosmetics - Payments Views
Payment-gateway-agnostic architecture.
Razorpay and Stripe integrations use env-configured credentials.
"""
import hmac
import hashlib
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderStatusHistory
from .models import Payment


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/
    Creates a gateway order and returns client data to initiate payment on the frontend.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method', 'razorpay')

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'paid':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        amount_paise = int(order.total * 100)  # Razorpay uses paise

        if payment_method == 'razorpay':
            return self._initiate_razorpay(order, amount_paise)
        elif payment_method == 'stripe':
            return self._initiate_stripe(order, amount_paise)
        elif payment_method == 'cod':
            return self._confirm_cod(order)
        else:
            return Response({'error': 'Unsupported payment method.'}, status=status.HTTP_400_BAD_REQUEST)

    def _initiate_razorpay(self, order, amount_paise):
        try:
            import razorpay
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            rz_order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'receipt': str(order.order_number),
                'notes': {'order_id': str(order.id)},
            })
            payment = Payment.objects.create(
                order=order,
                payment_method='razorpay',
                gateway_order_id=rz_order['id'],
                amount=order.total,
                status='pending',
            )
            return Response({
                'gateway': 'razorpay',
                'key_id': settings.RAZORPAY_KEY_ID,
                'gateway_order_id': rz_order['id'],
                'amount': amount_paise,
                'currency': 'INR',
                'order_number': order.order_number,
                'payment_id': str(payment.id),
                'prefill': {
                    'name': order.shipping_full_name,
                    'email': order.guest_email or (order.user.email if order.user else ''),
                    'contact': order.shipping_phone,
                },
            })
        except Exception as e:
            return Response({'error': f'Payment gateway error: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def _initiate_stripe(self, order, amount_paise):
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            intent = stripe.PaymentIntent.create(
                amount=amount_paise,
                currency='inr',
                metadata={'order_id': str(order.id), 'order_number': order.order_number},
            )
            payment = Payment.objects.create(
                order=order,
                payment_method='stripe',
                gateway_order_id=intent.id,
                amount=order.total,
                status='pending',
            )
            return Response({
                'gateway': 'stripe',
                'client_secret': intent.client_secret,
                'payment_id': str(payment.id),
            })
        except Exception as e:
            return Response({'error': f'Stripe error: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def _confirm_cod(self, order):
        order.payment_status = 'cod_pending'
        order.order_status = 'confirmed'
        order.save(update_fields=['payment_status', 'order_status'])
        Payment.objects.create(
            order=order,
            payment_method='cod',
            amount=order.total,
            status='pending',
        )
        OrderStatusHistory.objects.create(order=order, status='confirmed', note='COD order confirmed.')
        return Response({'message': 'COD order confirmed.', 'order_number': order.order_number})


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Verifies Razorpay payment signature and marks the order as paid.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id', '')
        razorpay_payment_id = request.data.get('razorpay_payment_id', '')
        razorpay_signature = request.data.get('razorpay_signature', '')

        # Verify signature
        message = f'{razorpay_order_id}|{razorpay_payment_id}'
        expected_sig = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            msg=message.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, razorpay_signature):
            return Response({'error': 'Payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(gateway_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.gateway_payment_id = razorpay_payment_id
        payment.gateway_signature = razorpay_signature
        payment.status = 'success'
        payment.save(update_fields=['gateway_payment_id', 'gateway_signature', 'status'])

        order = payment.order
        order.payment_status = 'paid'
        order.order_status = 'confirmed'
        order.save(update_fields=['payment_status', 'order_status'])
        OrderStatusHistory.objects.create(order=order, status='confirmed', note='Payment verified.')

        return Response({'message': 'Payment verified.', 'order_number': order.order_number})


class StripeWebhookView(APIView):
    """Stripe webhook endpoint — verify event and update payment/order."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'error': 'Invalid webhook.'}, status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            try:
                payment = Payment.objects.get(gateway_order_id=intent['id'])
                payment.status = 'success'
                payment.gateway_payment_id = intent['id']
                payment.save(update_fields=['status', 'gateway_payment_id'])
                payment.order.payment_status = 'paid'
                payment.order.order_status = 'confirmed'
                payment.order.save(update_fields=['payment_status', 'order_status'])
            except Payment.DoesNotExist:
                pass

        return Response({'status': 'received'})
