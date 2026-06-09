from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from projects.models import Procurement, Project
from finance.models import Invoice, InvoiceLineItem
from library.models import ProductImage
from crm.models import Client
from .models import ClientProject


class ClientProcurementSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_url = serializers.SerializerMethodField()
    dimension = serializers.SerializerMethodField()
    delivery_date = serializers.DateField(source='ETA', read_only=True)
    order_date = serializers.DateField(read_only=True)
    is_ordered = serializers.SerializerMethodField()
    qty = serializers.FloatField(source='quantity', read_only=True)
    unit = serializers.CharField(source='unit_type', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    room = serializers.CharField(source='room.name', read_only=True)
    supplier = serializers.SerializerMethodField()
    is_from_catalog = serializers.SerializerMethodField()
    supplier_order_status = serializers.SerializerMethodField()
    supplier_order_status_display = serializers.SerializerMethodField()
    quote_status = serializers.SerializerMethodField()
    quote_status_display = serializers.SerializerMethodField()
    awaiting_quote = serializers.SerializerMethodField()

    class Meta:
        model = Procurement
        fields = [
            'id',
            'product_name',
            'product_url',
            'dimension',
            'delivery_date',
            'order_date',
            'is_ordered',
            'qty',
            'unit',
            'unit_price',
            'total_price',
            'client_approval',
            'image',
            'room',
            'supplier',
            'is_from_catalog',
            'supplier_order_status',
            'supplier_order_status_display',
            'quote_status',
            'quote_status_display',
            'awaiting_quote',
        ]
        read_only_fields = [
            'id',
            'product_name',
            'product_url',
            'dimension',
            'delivery_date',
            'order_date',
            'is_ordered',
            'qty',
            'unit',
            'unit_price',
            'total_price',
            'image',
            'room',
            'supplier',
            'is_from_catalog',
            'supplier_order_status',
            'supplier_order_status_display',
            'quote_status',
            'quote_status_display',
            'awaiting_quote',
        ]

    def get_is_from_catalog(self, obj):
        return obj.catalog_product_id is not None

    def _order_line(self, obj):
        return getattr(obj, 'supplier_order_line', None)

    def get_product_name(self, obj):
        if obj.product:
            return obj.product.name
        if obj.catalog_product:
            return obj.catalog_product.name
        return 'Unnamed item'

    def get_product_url(self, obj):
        if obj.product and obj.product.url:
            return obj.product.url
        if obj.catalog_product and obj.catalog_product.url:
            return obj.catalog_product.url
        return None

    def get_dimension(self, obj):
        if obj.product and obj.product.dimension:
            return obj.product.dimension
        if obj.catalog_product and obj.catalog_product.dimension:
            return obj.catalog_product.dimension
        return None

    def get_supplier(self, obj):
        if obj.product and obj.product.supplier:
            return obj.product.supplier.company_name
        if obj.catalog_product:
            return obj.catalog_product.supplier.company_name
        return None

    def get_is_ordered(self, obj):
        return obj.status in {'ORD', 'IT', 'DEL', 'INS', 'PD'}

    def get_unit_price(self, obj):
        if obj.unit_price is not None:
            return float(obj.unit_price)
        if obj.product:
            if obj.product.tader_price:
                return float(obj.product.tader_price)
            return float(obj.product.regular_price or 0.0)
        if obj.catalog_product and obj.catalog_product.trade_price is not None:
            return float(obj.catalog_product.trade_price)
        return 0.0

    def get_total_price(self, obj):
        unit_price = self.get_unit_price(obj)
        if obj.quantity:
            return obj.quantity * unit_price
        return 0.0

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.catalog_product:
            image = obj.catalog_product.images.filter(is_primary=True).first() or obj.catalog_product.images.first()
            if image and image.image:
                url = image.image.url
                return request.build_absolute_uri(url) if request else url
        if obj.product:
            image_obj = ProductImage.objects.filter(product=obj.product, is_primary=True).first()
            if not image_obj:
                image_obj = ProductImage.objects.filter(product=obj.product).first()
            if image_obj and image_obj.image:
                url = image_obj.image.url
                return request.build_absolute_uri(url) if request else url
        return None

    def get_supplier_order_status(self, obj):
        order_line = self._order_line(obj)
        return order_line.status if order_line else None

    def get_supplier_order_status_display(self, obj):
        order_line = self._order_line(obj)
        return order_line.get_status_display() if order_line else None

    def get_quote_status(self, obj):
        order_line = self._order_line(obj)
        return order_line.quote_status if order_line else None

    def get_quote_status_display(self, obj):
        order_line = self._order_line(obj)
        return order_line.get_quote_status_display() if order_line else None

    def get_awaiting_quote(self, obj):
        order_line = self._order_line(obj)
        return bool(order_line and order_line.quote_status == 'RQ')


class ClientInvoiceLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total', 'product_name']

class ClientInvoiceSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    line_items = ClientInvoiceLineItemSerializer(many=True, read_only=True)
    trade_invoices = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    can_pay = serializers.SerializerMethodField()
    amount_due = serializers.SerializerMethodField()

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
            'trade_invoices',
            'client',
            'project',
            'can_pay',
            'amount_due',
            'paid_at',
        ]

    def get_invoice_number(self, obj):
        return f"INV-{obj.id:03d}"

    def get_client(self, obj):
        if not obj.client:
            return None
        return {
            'id': obj.client.id,
            'name': obj.client.name,
            'surname': obj.client.surname,
            'company_name': obj.client.company_name,
            'email': obj.client.email,
        }

    def get_project(self, obj):
        if not obj.project:
            return None
        return {
            'id': obj.project.id,
            'project_name': obj.project.project_name,
        }

    def get_can_pay(self, obj):
        from finance.payments import invoice_payable

        return invoice_payable(obj)

    def get_amount_due(self, obj):
        if obj.status == 'PD':
            return 0
        return float(obj.total_amount or 0)

    def get_trade_invoices(self, obj):
        request = self.context.get('request')
        return [
            {
                'po_id': po.id,
                'trade_invoice': request.build_absolute_uri(po.trade_invoice.url) if po.trade_invoice and request else (po.trade_invoice.url if po.trade_invoice else None),
            }
            for po in obj.purchase_orders.all()
        ]

class ClientLoginSerializer(serializers.Serializer):
    """Serializer for client portal login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        try:
            client = Client.objects.get(email=email, contact_type='CL')
        except Client.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')
        
        if not client.is_active:
            raise serializers.ValidationError('This account is inactive.')
        
        if not client.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')
        
        # Update last login
        client.last_login = timezone.now()
        client.save(update_fields=['last_login'])
        
        # Get accessible projects
        projects = Project.objects.filter(client_access_grants__client=client)
        
        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['client_id'] = client.id
        refresh['email'] = client.email
        refresh['type'] = 'client'
        
        attrs['client'] = client
        attrs['projects'] = projects
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)
        
        return attrs

class ClientProjectSerializer(serializers.ModelSerializer):
    """Serializer for client-project relationships."""
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)
    currency = serializers.CharField(source='project.currency', read_only=True)
    
    class Meta:
        model = ClientProject
        fields = ['id', 'project_id', 'project_name', 'currency', 'created_at']
