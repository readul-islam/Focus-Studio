from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientDocumentViewSet, ClientProcurementViewSet, client_dashboard, ClientInvoiceViewSet, ClientLoginView, generate_client_credentials, room_totals, copy_client_credentials, fetch_client_credentials_email_html

router = DefaultRouter()
router.register(r'documents', ClientDocumentViewSet, basename='client-documents')
router.register(r'procurements', ClientProcurementViewSet, basename='client-procurements')
router.register(r'invoices', ClientInvoiceViewSet, basename='client-invoices')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', client_dashboard, name='client-dashboard'),
    path('login/', ClientLoginView.as_view(), name='client-login'),
    path('generate-client-login/', generate_client_credentials, name='generate-client-credentials'),
    path('copy-client-credentials/', copy_client_credentials, name='copy-client-credentials'),
    path('fetch-client-email-html/', fetch_client_credentials_email_html, name='fetch-client-email-html'),
    path('room-totals/', room_totals, name='room-totals'),
]
