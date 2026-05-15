from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import (
    Q,
    Count,
    Case,
    When,
    Value
)
from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductGetSerializer, ProductImageSerializer, ProductUpdateSerializer
from users.models import User
from users.permissions import LibraryViewPermission
from techstyles.mixins import StudioScopedMixin


class ProductViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, LibraryViewPermission]

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return ProductUpdateSerializer
        return ProductSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated, LibraryViewPermission]

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        qs = ProductImage.objects.filter(product__studio=studio) if studio else ProductImage.objects.none()
        product_id = self.request.query_params.get('product')
        if product_id is not None:
            qs = qs.filter(product_id=product_id)
        return qs


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'results': data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated, LibraryViewPermission])
def get_studio_products(request):
    """
    Get all products for the authenticated user's studio with pagination and filtering.
    """
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response(
            {'error': 'User is not associated with any studio'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    products = Product.objects.filter(studio=user.studio)

    # Search query
    search_query = request.query_params.get('q', None)
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(materials__icontains=search_query) |
            Q(type__icontains=search_query) |
            Q(supplier__name__icontains=search_query) |
            Q(supplier__company_name__icontains=search_query) |
            Q(supplier__surname__icontains=search_query)
        )

    # Filter by supplier
    supplier_id = request.query_params.get('supplier', None)
    if supplier_id:
        products = products.filter(supplier_id=supplier_id)

    # Filter by type
    product_type = request.query_params.get('type', None)
    if product_type:
        products = products.filter(type__iexact=product_type)
    
    products = products.order_by('-id')

    paginator = ProductPagination()
    paginated_products = paginator.paginate_queryset(products, request)
    serializer = ProductGetSerializer(paginated_products, many=True)
    
    return paginator.get_paginated_response(serializer.data)
