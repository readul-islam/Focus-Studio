from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import ChangeLogViewSet

router = DefaultRouter()
router.register(r'', ChangeLogViewSet, basename='changelog')

urlpatterns = [
    path('', include(router.urls)),
]
