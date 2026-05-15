from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from projects.models import Procurement, Project
from finance.models import Invoice, InvoiceLineItem
from library.models import ProductImage
from crm.models import Client
from .models import ContractorProject, ContractorSharedProcurement, ContractorSharedDocument, ContractorMessage
from documents.serializers import DocumentSerializer


class ContractorDocumentSerializer(DocumentSerializer):
    """DocumentSerializer extended with per-contractor viewed_at / is_viewed fields.
    Reads from 'viewed_at_map' ({document_id: viewed_at}) injected into context."""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        viewed_at_map = self.context.get('viewed_at_map', {})
        viewed_at = viewed_at_map.get(instance.id)
        data['viewed_at'] = viewed_at
        data['is_viewed'] = viewed_at is not None
        return data


class ContractorProcurementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_url = serializers.URLField(source='product.url', read_only=True)
    dimension = serializers.CharField(source='product.dimension', read_only=True)
    delivery_date = serializers.DateField(source='ETA', read_only=True)
    qty = serializers.FloatField(source='quantity', read_only=True)
    unit = serializers.CharField(source='unit_type', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    room = serializers.CharField(source='room.name', read_only=True)
    supplier = serializers.CharField(source='product.supplier.company_name', read_only=True)
    viewed_at = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = Procurement
        fields = [
            'id',
            'product_name',
            'product_url',
            'dimension',
            'delivery_date',
            'qty',
            'unit',
            'unit_price',
            'total_price',
            'client_approval',
            'image',
            'room',
            'supplier',
            'viewed_at',
            'is_viewed',
        ]
        read_only_fields = [
            'id', 'product_name', 'product_url', 'dimension', 'delivery_date',
            'qty', 'unit', 'unit_price', 'total_price', 'image', 'room', 'supplier',
            'viewed_at', 'is_viewed',
        ]

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_unit_price(self, obj):
        if obj.product:
            if obj.product.tader_price:
                return obj.product.tader_price
            return obj.product.regular_price or 0.0
        return 0.0

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_total_price(self, obj):
        unit_price = self.get_unit_price(obj)
        if obj.quantity:
            return obj.quantity * unit_price
        return 0.0

    @extend_schema_field(OpenApiTypes.URI)
    def get_image(self, obj):
        if obj.product:
            image_obj = ProductImage.objects.filter(product=obj.product, is_primary=True).first()
            if not image_obj:
                image_obj = ProductImage.objects.filter(product=obj.product).first()

            if image_obj and image_obj.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(image_obj.image.url)
                return image_obj.image.url
        return None

    def get_viewed_at(self, obj):
        return self.context.get('viewed_at_map', {}).get(obj.id)

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_viewed(self, obj):
        return self.context.get('viewed_at_map', {}).get(obj.id) is not None


class ContractorInvoiceLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total', 'product_name']


class ContractorInvoiceSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    line_items = ContractorInvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'date',
            'due_date',
            'total_amount',
            'currency',
            'status',
            'line_items',
            'delivery_charge',
            'ffne',
            'ffne_desc',
        ]

    @extend_schema_field(OpenApiTypes.STR)
    def get_invoice_number(self, obj):
        return f"INV-{obj.id:03d}"


class ContractorLoginSerializer(serializers.Serializer):
    """Serializer for contractor portal login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        contractor = Client.objects.filter(email=email, contact_type='CN').first()
        if contractor is None:
            raise serializers.ValidationError('Invalid email or password.')

        if not contractor.is_active:
            raise serializers.ValidationError('This account is inactive.')

        if not contractor.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        # Update last login
        contractor.last_login = timezone.now()
        contractor.save(update_fields=['last_login'])

        # Get accessible projects
        projects = Project.objects.filter(contractor_access_grants__contractor=contractor)

        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['contractor_id'] = contractor.id
        refresh['email'] = contractor.email
        refresh['type'] = 'contractor'

        attrs['contractor'] = contractor
        attrs['projects'] = projects
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)

        return attrs


class ContractorProjectSerializer(serializers.ModelSerializer):
    """Serializer for contractor-project relationships."""
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)
    currency = serializers.CharField(source='project.currency', read_only=True)

    class Meta:
        model = ContractorProject
        fields = ['id', 'project_id', 'project_name', 'currency', 'created_at']


class ContractorSharedProcurementSerializer(serializers.ModelSerializer):
    """Serializer for procurement items shared with a contractor."""
    product_name = serializers.CharField(source='procurement.product.name', read_only=True)
    product_url = serializers.URLField(source='procurement.product.url', read_only=True)
    room = serializers.CharField(source='procurement.room.name', read_only=True)
    project_id = serializers.IntegerField(source='procurement.project_id', read_only=True)
    image = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = ContractorSharedProcurement
        fields = [
            'id',
            'procurement',
            'product_name',
            'product_url',
            'room',
            'project_id',
            'image',
            'shared_at',
            'viewed_at',
            'is_viewed',
        ]
        read_only_fields = fields

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_viewed(self, obj):
        return obj.viewed_at is not None

    @extend_schema_field(OpenApiTypes.URI)
    def get_image(self, obj):
        if obj.procurement.product:
            image_obj = ProductImage.objects.filter(
                product=obj.procurement.product, is_primary=True
            ).first()
            if not image_obj:
                image_obj = ProductImage.objects.filter(product=obj.procurement.product).first()
            if image_obj and image_obj.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(image_obj.image.url)
                return image_obj.image.url
        return None


class ContractorSharedDocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents/drawings shared with a contractor."""
    document_name = serializers.CharField(source='document.name', read_only=True)
    document_type = serializers.CharField(source='document.type', read_only=True)
    file_url = serializers.SerializerMethodField()
    project_id = serializers.IntegerField(source='document.project_id', read_only=True)
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = ContractorSharedDocument
        fields = [
            'id',
            'document',
            'document_name',
            'document_type',
            'file_url',
            'project_id',
            'shared_at',
            'viewed_at',
            'is_viewed',
            'confirmed',
        ]
        read_only_fields = fields

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_viewed(self, obj):
        return obj.viewed_at is not None

    @extend_schema_field(OpenApiTypes.URI)
    def get_file_url(self, obj):
        if obj.document.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.file.url)
            return obj.document.file.url
        return obj.document.link_url


class ContractorProfileSerializer(serializers.ModelSerializer):
    """Serializer for contractor profile CRUD operations."""
    trade = serializers.SerializerMethodField()
    access_code = serializers.SerializerMethodField()
    insurance_expiry = serializers.SerializerMethodField()
    insurance_document = serializers.SerializerMethodField()
    trade_cert = serializers.SerializerMethodField()
    emergency_contact_name = serializers.SerializerMethodField()
    emergency_contact_phone = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    shared_items_count = serializers.SerializerMethodField()
    shared_drawings_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'surname',
            'company_name',
            'email',
            'phone',
            'trade',
            'access_code',
            'insurance_expiry',
            'insurance_document',
            'trade_cert',
            'emergency_contact_name',
            'emergency_contact_phone',
            'notes',
            'last_login',
            'shared_items_count',
            'shared_drawings_count',
        ]
        read_only_fields = ['id', 'access_code', 'last_login', 'insurance_document', 'trade_cert', 'shared_items_count', 'shared_drawings_count']

    def _get_profile(self, obj):
        return getattr(obj, 'contractor_profile', None)

    def get_trade(self, obj):
        p = self._get_profile(obj)
        return p.trade if p else None

    def get_access_code(self, obj):
        p = self._get_profile(obj)
        return p.access_code if p else None

    def get_insurance_expiry(self, obj):
        p = self._get_profile(obj)
        return str(p.insurance_expiry) if p and p.insurance_expiry else None

    def get_emergency_contact_name(self, obj):
        p = self._get_profile(obj)
        return p.emergency_contact_name if p else None

    def get_emergency_contact_phone(self, obj):
        p = self._get_profile(obj)
        return p.emergency_contact_phone if p else None

    def get_notes(self, obj):
        p = self._get_profile(obj)
        return p.notes if p else None

    @extend_schema_field(OpenApiTypes.URI)
    def get_insurance_document(self, obj):
        p = self._get_profile(obj)
        if p and p.insurance_document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(p.insurance_document.url)
            return p.insurance_document.url
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_trade_cert(self, obj):
        p = self._get_profile(obj)
        if p and p.trade_cert:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(p.trade_cert.url)
            return p.trade_cert.url
        return None

    @extend_schema_field(OpenApiTypes.INT)
    def get_shared_items_count(self, obj):
        return ContractorSharedProcurement.objects.filter(contractor=obj).count()

    @extend_schema_field(OpenApiTypes.INT)
    def get_shared_drawings_count(self, obj):
        return ContractorSharedDocument.objects.filter(contractor=obj).count()


class ContractorViewSerializer(serializers.ModelSerializer):
    """Full contractor view serializer for the contractor detail panel."""
    shared_procurements = serializers.SerializerMethodField()
    shared_documents = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    drawing_count = serializers.SerializerMethodField()
    confirmed_drawing_count = serializers.SerializerMethodField()
    insurance_warning = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'surname',
            'company_name',
            'email',
            'phone',
            'last_login',
            'item_count',
            'drawing_count',
            'confirmed_drawing_count',
            'insurance_warning',
            'shared_procurements',
            'shared_documents',
        ]

    def _get_project_id(self):
        # Allow project_id to be injected directly into context (e.g. from project_contractors view)
        project_id = self.context.get('project_id')
        if project_id:
            return project_id
        request = self.context.get('request')
        return request.query_params.get('project_id') if request else None

    @extend_schema_field(ContractorSharedProcurementSerializer(many=True))
    def get_shared_procurements(self, obj):
        qs = ContractorSharedProcurement.objects.filter(contractor=obj).select_related(
            'procurement__product', 'procurement__room'
        )
        project_id = self._get_project_id()
        if project_id:
            qs = qs.filter(procurement__project_id=project_id)
        return ContractorSharedProcurementSerializer(qs, many=True, context=self.context).data

    @extend_schema_field(ContractorSharedDocumentSerializer(many=True))
    def get_shared_documents(self, obj):
        qs = ContractorSharedDocument.objects.filter(contractor=obj).select_related('document')
        project_id = self._get_project_id()
        if project_id:
            qs = qs.filter(document__project_id=project_id)
        return ContractorSharedDocumentSerializer(qs, many=True, context=self.context).data

    @extend_schema_field(OpenApiTypes.INT)
    def get_item_count(self, obj):
        project_id = self._get_project_id()
        qs = ContractorSharedProcurement.objects.filter(contractor=obj)
        if project_id:
            qs = qs.filter(procurement__project_id=project_id)
        return qs.count()

    @extend_schema_field(OpenApiTypes.INT)
    def get_drawing_count(self, obj):
        project_id = self._get_project_id()
        qs = ContractorSharedDocument.objects.filter(contractor=obj)
        if project_id:
            qs = qs.filter(document__project_id=project_id)
        return qs.count()

    @extend_schema_field(OpenApiTypes.INT)
    def get_confirmed_drawing_count(self, obj):
        project_id = self._get_project_id()
        qs = ContractorSharedDocument.objects.filter(contractor=obj, confirmed=True)
        if project_id:
            qs = qs.filter(document__project_id=project_id)
        return qs.count()

    @extend_schema_field(OpenApiTypes.STR)
    def get_insurance_warning(self, obj):
        """
        Return insurance warning status:
        - "expired" if insurance_expiry < today
        - "expiring_soon" if insurance_expiry < today + 30 days
        - "valid" if insurance_expiry >= today + 30 days
        - null if no insurance_expiry set
        """
        profile = getattr(obj, 'contractor_profile', None)
        insurance_expiry = profile.insurance_expiry if profile else None
        if not insurance_expiry:
            return None

        from datetime import date, timedelta
        today = date.today()
        expiring_soon_date = today + timedelta(days=30)

        if insurance_expiry < today:
            return "expired"
        elif insurance_expiry < expiring_soon_date:
            return "expiring_soon"
        else:
            return "valid"


class ContractorMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for contractor messages.
    """
    class Meta:
        model = ContractorMessage
        fields = ['id', 'project', 'contractor', 'content', 'sender_type', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'sender_type', 'contractor', 'project']
