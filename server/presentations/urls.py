from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PresentationViewSet,
    PresentationSlideViewSet,
    PresentationPinViewSet,
    PresentationCommentViewSet,
    public_presentation,
)

router = DefaultRouter()
router.register(r'presentations', PresentationViewSet, basename='presentation')
router.register(r'slides', PresentationSlideViewSet, basename='presentation-slide')
router.register(r'pins', PresentationPinViewSet, basename='presentation-pin')
router.register(r'comments', PresentationCommentViewSet, basename='presentation-comment')

urlpatterns = [
    path('public/<uuid:token>/', public_presentation, name='public-presentation'),
    path('', include(router.urls)),
]
