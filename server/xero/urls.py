from django.urls import path
from .views import xero_callback, xero_connect, push_bill, push_invoice, get_bill_status, get_invoice_status, disconnect_xero

urlpatterns = [
    path('xero/connect/', xero_connect, name='xero_connect'),
    path('xero/callback/', xero_callback, name='xero_callback'),
    path('xero/disconnect/', disconnect_xero, name='xero_disconnect'),
    path('invoice/push/', push_invoice),
    path('bill/push/', push_bill),
    path('invoice/<str:invoice_id>/status/', get_invoice_status),
    path('bill/<str:bill_id>/status/', get_bill_status),
]