from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Procurement

from .analytics import (
    build_category_breakdown,
    build_fulfillment_metrics,
    build_monthly_sales,
    build_payment_breakdown,
    build_studio_breakdown,
    build_supplier_summary,
    build_top_products,
)

from .authentication import SupplierJWTAuthentication
from .emails import send_supplier_application_received_email
from .models import CatalogProduct, CatalogProductImage, SupplierAccount, SupplierOrderLine
from .serializers import (
    AddCatalogProductToProjectSerializer,
    CatalogProductImageSerializer,
    CatalogProductSerializer,
    CatalogProductWriteSerializer,
    SupplierAccountSerializer,
    SupplierLoginSerializer,
    StudioRequestQuoteSerializer,
    SupplierOrderLineSerializer,
    SupplierOrderLineUpdateSerializer,
    SupplierQuoteSubmitSerializer,
    SupplierRegisterSerializer,
)


class SupplierRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SupplierRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier = serializer.save()
        send_supplier_application_received_email(supplier)
        return Response(
            {
                'message': 'Application submitted. You can sign in while we review your account.',
                'supplier': SupplierAccountSerializer(supplier).data,
            },
            status=status.HTTP_201_CREATED,
        )


class SupplierLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SupplierLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supplier = serializer.validated_data['supplier']
        return Response(
            {
                'access': serializer.validated_data['access'],
                'refresh': serializer.validated_data['refresh'],
                'supplier': SupplierAccountSerializer(supplier).data,
            }
        )


class SupplierCatalogProductViewSet(viewsets.ModelViewSet):
    authentication_classes = [SupplierJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return CatalogProduct.objects.filter(supplier=self.request.user).prefetch_related('images')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CatalogProductWriteSerializer
        return CatalogProductSerializer

    def _read_product(self, product):
        return CatalogProductSerializer(product, context={'request': self.request}).data

    def create(self, request, *args, **kwargs):
        write_serializer = CatalogProductWriteSerializer(
            data=request.data,
            context={'supplier': request.user, 'request': request},
        )
        write_serializer.is_valid(raise_exception=True)
        product = write_serializer.save(supplier=request.user)
        return Response(self._read_product(product), status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        write_serializer = CatalogProductWriteSerializer(
            instance,
            data=request.data,
            partial=partial,
            context={'supplier': request.user, 'request': request},
        )
        write_serializer.is_valid(raise_exception=True)
        product = write_serializer.save()
        return Response(self._read_product(product))

    partial_update = update

    @action(detail=True, methods=['post'], url_path='images')
    def upload_image(self, request, pk=None):
        product = self.get_object()
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'image file is required'}, status=status.HTTP_400_BAD_REQUEST)

        is_primary = request.data.get('is_primary', 'false').lower() in ('1', 'true', 'yes')
        if is_primary or not product.images.exists():
            product.images.update(is_primary=False)
            is_primary = True

        image = CatalogProductImage.objects.create(
            product=product,
            image=image_file,
            is_primary=is_primary,
        )
        return Response(
            CatalogProductImageSerializer(image, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='images/(?P<image_id>[0-9]+)/remove')
    def remove_image(self, request, pk=None, image_id=None):
        product = self.get_object()
        try:
            image = product.images.get(id=image_id)
        except CatalogProductImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

        was_primary = image.is_primary
        image.delete()
        if was_primary:
            next_image = product.images.first()
            if next_image:
                next_image.is_primary = True
                next_image.save(update_fields=['is_primary'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class SupplierOrderLineViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [SupplierJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierOrderLineSerializer

    def get_queryset(self):
        queryset = SupplierOrderLine.objects.filter(
            supplier=self.request.user,
        ).select_related('catalog_product', 'project', 'studio')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order_line = self.get_object()
        previous_status = order_line.status
        serializer = SupplierOrderLineUpdateSerializer(order_line, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        order_line.refresh_from_db()

        from .order_fulfillment import apply_order_line_status_change

        apply_order_line_status_change(order_line, previous_status=previous_status)
        return Response(SupplierOrderLineSerializer(order_line).data)

    @action(detail=True, methods=['post'], url_path='submit-quote')
    def submit_quote(self, request, pk=None):
        from .quotes import SupplierQuoteError, submit_catalog_quote

        order_line = self.get_object()
        serializer = SupplierQuoteSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order_line = submit_catalog_quote(
                order_line=order_line,
                unit_price=serializer.validated_data['unit_price'],
                lead_time_days=serializer.validated_data.get('lead_time_days'),
                notes=serializer.validated_data.get('notes', ''),
            )
        except SupplierQuoteError as exc:
            return Response({'detail': exc.message, 'code': exc.code}, status=status.HTTP_400_BAD_REQUEST)

        return Response(SupplierOrderLineSerializer(order_line).data)


@api_view(['GET'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_dashboard(request):
    supplier = request.user
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    order_lines = SupplierOrderLine.objects.filter(supplier=supplier)
    month_lines = order_lines.filter(created_at__gte=month_start)

    status_breakdown = (
        order_lines.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    return Response(
        {
            'summary': build_supplier_summary(supplier, order_lines, month_lines),
            'monthly_sales': build_monthly_sales(order_lines),
            'status_breakdown': list(status_breakdown),
        }
    )


@api_view(['GET'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_analytics(request):
    supplier = request.user
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    order_lines = SupplierOrderLine.objects.filter(supplier=supplier)
    month_lines = order_lines.filter(created_at__gte=month_start)

    return Response(
        {
            'summary': build_supplier_summary(supplier, order_lines, month_lines),
            'monthly_sales': build_monthly_sales(order_lines),
            'status_breakdown': list(
                order_lines.values('status').annotate(count=Count('id')).order_by('status')
            ),
            'payment_breakdown': build_payment_breakdown(order_lines),
            'top_products': build_top_products(order_lines),
            'studio_breakdown': build_studio_breakdown(order_lines),
            'category_breakdown': build_category_breakdown(supplier),
            'fulfillment': build_fulfillment_metrics(order_lines),
        }
    )


@api_view(['GET'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_me(request):
    return Response(SupplierAccountSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def browse_catalog(request):
    """Studio users browse verified, published catalog products."""
    studio = getattr(request.user, 'studio', None)
    if not studio:
        return Response({'error': 'Your account is not linked to a studio.'}, status=status.HTTP_400_BAD_REQUEST)

    queryset = CatalogProduct.objects.filter(
        is_published=True,
        supplier__is_active=True,
        supplier__is_verified=True,
    ).select_related('supplier').prefetch_related('images')

    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__icontains=search)
            | Q(supplier__company_name__icontains=search)
        )

    category = request.query_params.get('category')
    if category:
        queryset = queryset.filter(category__iexact=category)

    supplier_id = request.query_params.get('supplier')
    if supplier_id:
        queryset = queryset.filter(supplier_id=supplier_id)

    serializer = CatalogProductSerializer(
        queryset.order_by('-updated_at')[:100],
        many=True,
        context={'request': request},
    )
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_catalog_product_to_project(request):
    """Add a global catalog product to a project procurement list."""
    serializer = AddCatalogProductToProjectSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)

    catalog_product = serializer.validated_data['catalog_product']
    project = serializer.validated_data['project']
    studio = serializer.validated_data['studio']
    quantity = serializer.validated_data['quantity']
    room_id = serializer.validated_data.get('room_id')

    procurement = Procurement.objects.create(
        project=project,
        room_id=room_id,
        catalog_product=catalog_product,
        quantity=quantity,
        unit_price=catalog_product.trade_price,
        studio=studio,
        created_by=request.user,
        status='IR',
    )

    return Response(
        {
            'procurement_id': procurement.id,
            'catalog_product_id': catalog_product.id,
            'project_id': project.id,
            'message': 'Catalog product added to project procurement.',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_stripe_connect_status(request):
    from .stripe_connect import connect_status

    payload = connect_status(request.user, fallback_email=request.user.email)
    return Response(payload)


@api_view(['POST'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_stripe_connect_sync(request):
    from .stripe_connect import connect_status

    payload = connect_status(request.user, fallback_email=request.user.email)
    return Response(payload)


@api_view(['POST'])
@authentication_classes([SupplierJWTAuthentication])
@permission_classes([IsAuthenticated])
def supplier_stripe_connect_onboard(request):
    from .stripe_connect import SupplierStripeConnectError, create_onboarding_link, stripe_configured

    if not stripe_configured():
        return Response({'detail': 'Stripe is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    email = (request.data.get('email') or request.user.email or '').strip()
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        url = create_onboarding_link(supplier=request.user, user_email=email)
    except SupplierStripeConnectError as exc:
        status_code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if exc.code in ('connect_not_enabled', 'not_configured')
            else status.HTTP_400_BAD_REQUEST
        )
        return Response({'detail': exc.message, 'code': exc.code}, status=status_code)

    return Response({'url': url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def studio_pay_supplier_order(request):
    """Create a Stripe Checkout session for a catalog procurement payment to the supplier."""
    from django.conf import settings

    from .payments import SupplierPaymentError, create_supplier_order_checkout

    procurement_id = request.data.get('procurement_id')
    if not procurement_id:
        return Response({'detail': 'procurement_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    studio = getattr(request.user, 'studio', None)
    if not studio:
        return Response({'detail': 'Your account is not linked to a studio.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        procurement = Procurement.objects.select_related('catalog_product', 'project').get(
            id=procurement_id,
            studio=studio,
            catalog_product__isnull=False,
        )
    except Procurement.DoesNotExist:
        return Response({'detail': 'Catalog procurement item not found.'}, status=status.HTTP_404_NOT_FOUND)

    frontend = settings.FRONTEND_URL.rstrip('/')
    project_id = procurement.project_id
    success_url = request.data.get('success_url') or f'{frontend}/projects/{project_id}/procurement?supplier_paid=1'
    cancel_url = request.data.get('cancel_url') or f'{frontend}/projects/{project_id}/procurement?supplier_paid=0'

    try:
        checkout_url = create_supplier_order_checkout(
            procurement=procurement,
            success_url=success_url,
            cancel_url=cancel_url,
            paid_by_user=request.user,
        )
    except SupplierPaymentError as exc:
        status_code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if exc.code == 'not_configured'
            else status.HTTP_400_BAD_REQUEST
        )
        return Response({'detail': exc.message, 'code': exc.code}, status=status_code)

    return Response({'url': checkout_url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def studio_request_catalog_quote(request):
    from .quotes import SupplierQuoteError, request_catalog_quote

    serializer = StudioRequestQuoteSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    procurement = serializer.validated_data['procurement']

    try:
        order_line = request_catalog_quote(
            procurement=procurement,
            message=serializer.validated_data.get('message', ''),
        )
    except SupplierQuoteError as exc:
        return Response({'detail': exc.message, 'code': exc.code}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            'procurement_id': procurement.id,
            'order_line_id': order_line.id,
            'quote_status': order_line.quote_status,
            'message': 'Quote request sent to supplier.',
        },
        status=status.HTTP_200_OK,
    )
