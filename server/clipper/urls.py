from django.urls import path
from .views import ProductClipperView, ProductSaveView

urlpatterns = [
    path('extract_product_details/', ProductClipperView.as_view(), name='product-clipper-extract'),
    path('save_product/', ProductSaveView.as_view(), name='product-clipper-save'),
]
