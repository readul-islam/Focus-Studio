from django.urls import path

from .views import quickbooks_callback, quickbooks_connect, quickbooks_disconnect, quickbooks_status

urlpatterns = [
    path('connect/', quickbooks_connect, name='quickbooks-connect'),
    path('callback/', quickbooks_callback, name='quickbooks-callback'),
    path('disconnect/', quickbooks_disconnect, name='quickbooks-disconnect'),
    path('status/', quickbooks_status, name='quickbooks-status'),
]
