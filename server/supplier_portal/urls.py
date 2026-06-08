from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    SupplierCatalogProductViewSet,
    SupplierLoginView,
    SupplierOrderLineViewSet,
    SupplierRegisterView,
    add_catalog_product_to_project,
    browse_catalog,
    studio_pay_supplier_order,
    studio_request_catalog_quote,
    supplier_dashboard,
    supplier_analytics,
    supplier_me,
    supplier_stripe_connect_onboard,
    supplier_stripe_connect_status,
    supplier_stripe_connect_sync,
)

router = DefaultRouter()
router.register(r'products', SupplierCatalogProductViewSet, basename='supplier-catalog-products')
router.register(r'orders', SupplierOrderLineViewSet, basename='supplier-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', SupplierRegisterView.as_view(), name='supplier-register'),
    path('login/', SupplierLoginView.as_view(), name='supplier-login'),
    path('dashboard/', supplier_dashboard, name='supplier-dashboard'),
    path('analytics/', supplier_analytics, name='supplier-analytics'),
    path('me/', supplier_me, name='supplier-me'),
    path('stripe-connect/status/', supplier_stripe_connect_status, name='supplier-stripe-connect-status'),
    path('stripe-connect/sync/', supplier_stripe_connect_sync, name='supplier-stripe-connect-sync'),
    path('stripe-connect/onboard/', supplier_stripe_connect_onboard, name='supplier-stripe-connect-onboard'),
    path('studio/payments/checkout/', studio_pay_supplier_order, name='studio-pay-supplier-order'),
    path('studio/quotes/request/', studio_request_catalog_quote, name='studio-request-catalog-quote'),
    path('catalog/browse/', browse_catalog, name='catalog-browse'),
    path('catalog/add-to-project/', add_catalog_product_to_project, name='catalog-add-to-project'),
]
