from django.urls import path
from .views import get_notifications, get_unread_count, mark_as_read, mark_all_as_read

urlpatterns = [
    path('', get_notifications, name='notifications-list'),
    path('unread-count/', get_unread_count, name='notifications-unread-count'),
    path('mark-all-read/', mark_all_as_read, name='notifications-mark-all-read'),
    path('<int:notification_id>/read/', mark_as_read, name='notification-mark-read'),
]
