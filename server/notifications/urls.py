from django.urls import path
from .views import get_notifications, get_unread_count, mark_as_read, mark_all_as_read, register_push_token

urlpatterns = [
    path('', get_notifications, name='notifications-list'),
    path('unread-count/', get_unread_count, name='notifications-unread-count'),
    path('mark-all-read/', mark_all_as_read, name='notifications-mark-all-read'),
    path('push-token/', register_push_token, name='notifications-push-token'),
    path('<int:notification_id>/read/', mark_as_read, name='notification-mark-read'),
]
