from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectTeamMessageViewSet,
    presence_heartbeat,
    presence_list,
    notify_mention,
    chat_attachments_list,
)

router = DefaultRouter()
router.register(r'messages', ProjectTeamMessageViewSet, basename='team-messages')

urlpatterns = [
    path('presence/heartbeat/', presence_heartbeat, name='presence-heartbeat'),
    path('presence/', presence_list, name='presence-list'),
    path('notify-mention/', notify_mention, name='notify-mention'),
    path('chat-attachments/', chat_attachments_list, name='chat-attachments-list'),
    path('', include(router.urls)),
]
