from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet
from .webhook_views import vexa_webhook

router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = [
    path('vexa/webhook/', vexa_webhook, name='vexa-webhook'),
    path('', include(router.urls)),
]
