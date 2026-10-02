from django.urls import path
from .views import (
    NotificationListView, MarkNotificationReadView,
    UnreadNotificationCountView, NewsletterSubscribeView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='notification-unread-count'),
    path('mark-read/', MarkNotificationReadView.as_view(), name='notifications-mark-all-read'),
    path('<int:pk>/mark-read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
]
