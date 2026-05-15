from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, LeadViewSet, ProposalViewSet, get_studio_clients, get_studio_suppliers, get_studio_contacts

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'proposals', ProposalViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('studio-clients/', get_studio_clients, name='studio-clients'),
    path('studio-suppliers/', get_studio_suppliers, name='studio-suppliers'),
    path('studio-contacts/', get_studio_contacts, name='studio-contacts'),
]