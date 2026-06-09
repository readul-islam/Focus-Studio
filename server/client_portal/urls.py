from django.urls import path, include
from rest_framework.routers import DefaultRouter
from client_portal.authentication import ClientJWTAuthentication
from help_center.portal_views import make_portal_support_views
from .views import (
    ClientDocumentViewSet,
    ClientProcurementViewSet,
    client_dashboard,
    ClientInvoiceViewSet,
    ClientPresentationViewSet,
    ClientLoginView,
    generate_client_credentials,
    room_totals,
    copy_client_credentials,
    fetch_client_credentials_email_html,
    pay_client_invoice,
)

client_support_conversation, client_support_chat, client_support_clear = make_portal_support_views(
    ClientJWTAuthentication,
    'client_portal',
)

router = DefaultRouter()
router.register(r'documents', ClientDocumentViewSet, basename='client-documents')
router.register(r'procurements', ClientProcurementViewSet, basename='client-procurements')
router.register(r'invoices', ClientInvoiceViewSet, basename='client-invoices')
router.register(r'presentations', ClientPresentationViewSet, basename='client-presentations')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', client_dashboard, name='client-dashboard'),
    path('login/', ClientLoginView.as_view(), name='client-login'),
    path('generate-client-login/', generate_client_credentials, name='generate-client-credentials'),
    path('copy-client-credentials/', copy_client_credentials, name='copy-client-credentials'),
    path('fetch-client-email-html/', fetch_client_credentials_email_html, name='fetch-client-email-html'),
    path('room-totals/', room_totals, name='room-totals'),
    path('invoices/<int:invoice_id>/pay/', pay_client_invoice, name='client-invoice-pay'),
    path('support/conversation/', client_support_conversation, name='client-support-conversation'),
    path('support/chat/', client_support_chat, name='client-support-chat'),
    path('support/conversation/clear/', client_support_clear, name='client-support-conversation-clear'),
]
