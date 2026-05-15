from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from projects.models import Procurement, Project
from finance.models import Invoice, InvoiceLineItem
from library.models import ProductImage
from crm.models import Client
from .models import ClientProject

class ClientProcurementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_url = serializers.URLField(source='product.url', read_only=True)
    dimension = serializers.CharField(source='product.dimension', read_only=True)
    delivery_date = serializers.DateField(source='ETA', read_only=True)
    order_date = serializers.DateField(read_only=True)
    is_ordered = serializers.SerializerMethodField()
    qty = serializers.FloatField(source='quantity', read_only=True)
    unit = serializers.CharField(source='unit_type', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    room = serializers.CharField(source='room.name', read_only=True)
    supplier = serializers.CharField(source='product.supplier.company_name', read_only=True)

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
        ]
        read_only_fields = ['id', 'product_name', 'product_url', 'dimension', 'delivery_date', 'order_date', 'is_ordered', 'qty', 'unit', 'unit_price', 'total_price', 'image', 'room', 'supplier']

    def get_is_ordered(self, obj):
        return obj.status == 'ORD'

    def get_unit_price(self, obj):
        if obj.product:
            if obj.product.tader_price:
                return obj.product.tader_price
            return obj.product.regular_price or 0.0
        return 0.0

    def get_total_price(self, obj):
        unit_price = self.get_unit_price(obj)
        if obj.quantity:
            return obj.quantity * unit_price
        return 0.0

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

class ClientInvoiceLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total', 'product_name']

class ClientInvoiceSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    line_items = ClientInvoiceLineItemSerializer(many=True, read_only=True)
    trade_invoices = serializers.SerializerMethodField()

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
        ]

    def get_invoice_number(self, obj):
        return f"INV-{obj.id:03d}"

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
