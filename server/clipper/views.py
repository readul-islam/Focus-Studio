from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from .serializers import ProductClipperRequestSerializer, ProductClipperResponseSerializer, ProductSaveSerializer
from .utils import extract_product_data, normalize_url
from rest_framework.permissions import AllowAny, IsAuthenticated
from crm.models import Client
from library.models import Product, ProductImage
from django.db.models import Q
import requests
from django.core.files.base import ContentFile
from urllib.parse import urlparse
import os

class ProductClipperView(APIView):
    """
    API endpoint that receives page content and returns structured product data.
    """
    permission_classes = [IsAuthenticated]
    @extend_schema(
        request=ProductClipperRequestSerializer,
        responses={200: ProductClipperResponseSerializer},
        description="Extract structured product data from page content using AI."
    )
    def post(self, request):
        serializer = ProductClipperRequestSerializer(data=request.data)
        if serializer.is_valid():
            content = serializer.validated_data['content']
            image_urls = [normalize_url(url) for url in serializer.validated_data.get('image_urls', [])]
            extracted_data = extract_product_data(content, image_urls=image_urls)
            
            if extracted_data:
                # Supplier lookup logic
                supplier_name = extracted_data.get('supplier_name')
                if supplier_name:
                    # Filter for suppliers (contact_type='SP') matching the extracted name
                    supplier = Client.objects.filter(
                        Q(company_name__icontains=supplier_name) | Q(name__icontains=supplier_name),
                        contact_type='SP'
                    ).first()
                    
                    if supplier:
                        extracted_data['supplier'] = {
                            "id": supplier.id,
                            "name": supplier.name,
                            "company_name": supplier.company_name
                        }
                    else:
                        extracted_data['supplier'] = None
                
                # Normalize output images from AI
                if 'images' in extracted_data and isinstance(extracted_data['images'], list):
                    extracted_data['images'] = [normalize_url(url) for url in extracted_data['images']]
                
                return Response(extracted_data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Failed to extract product data from the provided content."},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductSaveView(APIView):
    """
    API endpoint to save a product and its images.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ProductSaveSerializer,
        responses={201: ProductClipperResponseSerializer},
        description="Save product and its images to the library."
    )
    def post(self, request):
        serializer = ProductSaveSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Create the product
            product = Product.objects.create(
                name=data.get('name'),
                description=data.get('description'),
                currency=data.get('currency'),
                tader_price=data.get('trade_price'),
                regular_price=data.get('regular_price'),
                measurement=data.get('measurement'),
                is_fav=data.get('is_fav', False),
                materials=data.get('materials'),
                dimension=data.get('dimension'),
                weight=data.get('weight'),
                box_dimension=data.get('box_dimension'),
                assembly_required=data.get('assembly_required', False),
                seat_width=data.get('seat_width'),
                seat_depth=data.get('seat_depth'),
                seat_height=data.get('seat_height'),
                composition=data.get('composition'),
                construction=data.get('construction'),
                feet=data.get('feet'),
                filling=data.get('filling'),
                removeable_cushion=data.get('removeable_cushion', True),
                removeable_legs=data.get('removeable_legs', False),
                frame=data.get('frame'),
                type=data.get('type'),
                instruction=data.get('instruction'),
                url=data.get('url'),
                studio=request.user.studio,
                created_by=request.user
            )
            
            # Handle supplier
            supplier_id = data.get('supplier_id')
            if supplier_id:
                try:
                    supplier = Client.objects.get(id=supplier_id, studio=request.user.studio)
                    product.supplier = supplier
                    product.save()
                except Client.DoesNotExist:
                    pass
            
            # Save images
            image_urls = [normalize_url(url) for url in data.get('image_urls', [])]
            for index, image_url in enumerate(image_urls):
                try:
                    response = requests.get(image_url, timeout=10)
                    if response.status_code == 200:
                        # Get filename from URL or use a default
                        parsed_url = urlparse(image_url)
                        extension = os.path.splitext(parsed_url.path)[1]
                        if not extension:
                            extension = ".jpg"
                        
                        filename = f"product_{product.id}_{index}{extension}"
                        
                        product_image = ProductImage(
                            product=product,
                            is_primary=(index == 0),
                            studio=request.user.studio,
                            created_by=request.user
                        )
                        product_image.image.save(filename, ContentFile(response.content), save=True)
                except Exception as e:
                    # In a real app we might log this to Sentry or similar
                    print(f"Failed to download image: {image_url}, error: {e}")
            
            return Response({"message": "Product saved successfully", "product_id": product.id}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
