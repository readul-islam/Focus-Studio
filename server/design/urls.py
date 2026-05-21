from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DesignSessionViewSet, design_chat, design_generate, design_asset_detail

router = DefaultRouter()
router.register(r'sessions', DesignSessionViewSet, basename='design-session')

urlpatterns = [
    path('chat/', design_chat),
    path('generate/', design_generate),
    path('assets/<int:asset_id>/', design_asset_detail),
    path('', include(router.urls)),
]
