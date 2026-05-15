from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, InvoiceViewSet, get_studio_finance, get_project_finance, CreatePOFromProcurementView, CreateInvoiceView

router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'create-po-from-procurement', CreatePOFromProcurementView, basename='create-po-from-procurement')
router.register(r'create-invoice', CreateInvoiceView, basename='create-invoice')

urlpatterns = [
    path('', include(router.urls)),
    path('studio-finance/', get_studio_finance, name='studio-finance'),
    path('project-finance/', get_project_finance, name='project-finance'),
]
