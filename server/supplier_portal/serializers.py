from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from projects.models import Procurement, Project

from .models import CatalogProduct, CatalogProductImage, SupplierAccount, SupplierOrderLine


class SupplierLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            supplier = SupplierAccount.objects.get(email=email)
        except SupplierAccount.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')

        if not supplier.is_active:
            raise serializers.ValidationError('This account is inactive.')

        if not supplier.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        supplier.last_login = timezone.now()
        supplier.save(update_fields=['last_login'])

        refresh = RefreshToken()
        refresh['supplier_account_id'] = supplier.id
        refresh['email'] = supplier.email
        refresh['type'] = 'supplier'

        attrs['supplier'] = supplier
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)
        return attrs


class CatalogProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CatalogProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class CatalogProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = CatalogProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = CatalogProduct
        fields = [
            'id',
            'supplier',
            'supplier_name',
            'name',
            'sku',
            'url',
            'description',
            'category',
            'currency',
            'trade_price',
            'retail_price',
            'lead_time_days',
            'dimension',
            'materials',
            'weight',
            'is_published',
            'primary_image',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'supplier', 'supplier_name', 'primary_image', 'images', 'created_at', 'updated_at']

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not image or not image.image:
            return None
        request = self.context.get('request')
        url = image.image.url
        return request.build_absolute_uri(url) if request else url


class CatalogProductProcurementSerializer(serializers.ModelSerializer):
    """Compact catalog product shape for procurement list/detail views."""

    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    tader_price = serializers.DecimalField(
        source='trade_price', max_digits=12, decimal_places=2, read_only=True,
    )
    regular_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = CatalogProduct
        fields = [
            'id',
            'name',
            'sku',
            'url',
            'description',
            'category',
            'currency',
            'trade_price',
            'retail_price',
            'tader_price',
            'regular_price',
            'lead_time_days',
            'dimension',
            'materials',
            'supplier_name',
            'primary_image',
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not image or not image.image:
            return None
        request = self.context.get('request')
        url = image.image.url
        return request.build_absolute_uri(url) if request else url


class CatalogProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogProduct
        fields = [
            'name',
            'sku',
            'url',
            'description',
            'category',
            'currency',
            'trade_price',
            'retail_price',
            'lead_time_days',
            'dimension',
            'materials',
            'weight',
            'is_published',
        ]

    def validate(self, attrs):
        if attrs.get('is_published'):
            supplier = self.context.get('supplier')
            if supplier and not supplier.is_verified:
                raise serializers.ValidationError(
                    'Your account must be verified before publishing products to the global catalog.'
                )
        return attrs


class SupplierOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='catalog_product.name', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    studio_name = serializers.CharField(source='studio.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    quote_status_display = serializers.CharField(source='get_quote_status_display', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = SupplierOrderLine
        fields = [
            'id',
            'product_name',
            'project_name',
            'studio_name',
            'quantity',
            'unit_price',
            'total_price',
            'currency',
            'status',
            'status_display',
            'quote_status',
            'quote_status_display',
            'quote_requested_at',
            'quoted_at',
            'quoted_lead_time_days',
            'quote_notes',
            'delivery_address',
            'delivery_city',
            'delivery_postcode',
            'delivery_country',
            'notes',
            'payment_status',
            'ordered_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_total_price(self, obj):
        if obj.unit_price is None:
            return None
        return float(obj.unit_price) * (obj.quantity or 1)


class SupplierOrderLineUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierOrderLine
        fields = ['status', 'notes']

    def validate_status(self, value):
        instance = self.instance
        if not instance:
            return value
        allowed = {
            'RQ': {'CF', 'CN'},
            'CF': {'SH', 'CN'},
            'SH': {'DL', 'CN'},
            'DL': set(),
            'CN': set(),
        }
        if value not in allowed.get(instance.status, set()) and value != instance.status:
            raise serializers.ValidationError(
                f'Cannot change status from {instance.get_status_display()} to {value}.'
            )
        return value


class SupplierQuoteSubmitSerializer(serializers.Serializer):
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    lead_time_days = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class StudioRequestQuoteSerializer(serializers.Serializer):
    procurement_id = serializers.IntegerField()
    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate(self, attrs):
        request = self.context['request']
        studio = getattr(request.user, 'studio', None)
        if not studio:
            raise serializers.ValidationError('Your account is not linked to a studio.')

        try:
            procurement = Procurement.objects.select_related('catalog_product', 'project').get(
                id=attrs['procurement_id'],
                studio=studio,
                catalog_product__isnull=False,
            )
        except Procurement.DoesNotExist:
            raise serializers.ValidationError('Catalog procurement item not found.')

        attrs['procurement'] = procurement
        return attrs


class SupplierRegisterSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=200)
    contact_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    categories = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True,
    )

    def validate_email(self, value):
        if SupplierAccount.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A supplier account with this email already exists.')
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        supplier = SupplierAccount.objects.create(
            **validated_data,
            is_verified=False,
            is_active=True,
        )
        supplier.set_password(password)
        supplier.save(update_fields=['password'])
        return supplier


class SupplierAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierAccount
        fields = [
            'id',
            'company_name',
            'contact_name',
            'email',
            'phone',
            'website',
            'description',
            'country',
            'city',
            'categories',
            'is_verified',
            'created_at',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']


class AddCatalogProductToProjectSerializer(serializers.Serializer):
    catalog_product_id = serializers.IntegerField()
    project_id = serializers.IntegerField()
    room_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.FloatField(default=1, min_value=0.01)

    def validate(self, attrs):
        request = self.context['request']
        studio = getattr(request.user, 'studio', None)
        if not studio:
            raise serializers.ValidationError('Your account is not linked to a studio.')

        try:
            catalog_product = CatalogProduct.objects.select_related('supplier').get(
                id=attrs['catalog_product_id'],
                is_published=True,
                supplier__is_active=True,
                supplier__is_verified=True,
            )
        except CatalogProduct.DoesNotExist:
            raise serializers.ValidationError('Catalog product not found or unavailable.')

        try:
            project = Project.objects.get(id=attrs['project_id'], studio=studio)
        except Project.DoesNotExist:
            raise serializers.ValidationError('Project not found.')

        attrs['catalog_product'] = catalog_product
        attrs['project'] = project
        attrs['studio'] = studio
        return attrs
