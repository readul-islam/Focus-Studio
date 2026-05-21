from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DesignSessionViewSet,
    design_chat,
    design_generate,
    design_generate_3d,
    design_meshy_status,
    design_asset_detail,
    design_asset_model,
)

router = DefaultRouter()
router.register(r'sessions', DesignSessionViewSet, basename='design-session')

urlpatterns = [
    path('chat/', design_chat),
    path('generate/', design_generate),
    path('generate-3d/', design_generate_3d),
    path('meshy-status/', design_meshy_status),
    path('assets/<int:asset_id>/', design_asset_detail),
    path('assets/<int:asset_id>/model/', design_asset_model, name='design-asset-model'),
    path('', include(router.urls)),
]
