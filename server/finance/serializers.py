from rest_framework import serializers
from .models import PurchaseOrder, POLineItem, Invoice, InvoiceLineItem
from decimal import Decimal
from projects.models import Procurement
from crm.serializers import ClientSerializer
from users.serializers import StudioSerializer
from projects.serializers import ProjectSerializer

class LineItemProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = ['id', 'image', 'is_primary']

class LineItemProductSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = None
        fields = ['id', 'name', 'images']
    
    def get_images(self, obj):
        from library.models import ProductImage
        LineItemProductImageSerializer.Meta.model = ProductImage
        images = obj.images.all()
        return LineItemProductImageSerializer(images, many=True).data

class POLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = POLineItem
        fields = ['id', 'product', 'description', 'quantity', 'unit_price', 'total', 'account_code']
        read_only_fields = ['total']

class POLineItemGetSerializer(serializers.ModelSerializer):
    """Serializer for GET requests that includes nested product details"""
    from library.models import Product
    LineItemProductSerializer.Meta.model = Product
    product = LineItemProductSerializer(read_only=True)
    
    class Meta:
        model = POLineItem
        fields = ['id', 'product', 'description', 'quantity', 'unit_price', 'total', 'account_code']
        read_only_fields = ['total']

class PODownloadSerializer(serializers.ModelSerializer):
    line_items = POLineItemGetSerializer(many=True)
    project = ProjectSerializer(read_only=True)
    supplier = ClientSerializer(read_only=True)
    studio = StudioSerializer(read_only=True)
    display_po = serializers.SerializerMethodField()
    product_details_enriched = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'project', 'supplier', 'status', 'date', 'due_date', 'total_amount', 'currency', 'delivery_charge', 'studio', 'line_items', 
                  'xero_sync', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error', 'display_po', 'product_details_enriched']
        read_only_fields = ['total_amount', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']

    def get_display_po(self, obj):
        return f"PO-{obj.id:03d}"
    
    def get_product_details_enriched(self, obj):
        enriched_data = []
        for item in obj.line_items.all():
            product = item.product
            supplier = obj.supplier
            
            details = {
                'product_name': product.name if product else item.description,
                'product_dimensions': product.dimension if product else None,
                'quantity': item.quantity,
                'supplier_name': supplier.name if supplier else None,
                'supplier_company': supplier.company_name if supplier else None,
                'supplier_email': supplier.email if supplier else None,
                'supplier_phone': supplier.phone if supplier else None,
                'supplier_address': ' '.join(filter(None, [supplier.address_line_1, supplier.address_line_2])) if supplier else None,
                'supplier_contact_person': f"{supplier.name} {supplier.surname}".strip() if supplier and supplier.surname else (supplier.name if supplier else None)
            }
            enriched_data.append(details)
        return enriched_data

class PurchaseOrderGetSerializer(serializers.ModelSerializer):
    line_items = POLineItemGetSerializer(many=True)
    project = ProjectSerializer(read_only=True)
    supplier = ClientSerializer(read_only=True)
    studio = StudioSerializer(read_only=True)
    display_po = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'project', 'supplier', 'status', 'date', 'due_date', 'total_amount', 'currency', 'delivery_charge', 'studio', 'line_items',
                  'trade_invoice', 'xero_sync', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error', 'display_po']
        read_only_fields = ['total_amount', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        total_amount = 0
        for item_data in line_items_data:
            line_item = POLineItem.objects.create(po=purchase_order, **item_data)
            total_amount += line_item.total
        
        if purchase_order.delivery_charge:
            total_amount += Decimal(purchase_order.delivery_charge)
            
        purchase_order.total_amount = total_amount
        purchase_order.save()
        return purchase_order

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)

        if 'trade_invoice' in validated_data and instance.trade_invoice:
            instance.trade_invoice.delete(save=False)

        instance = super().update(instance, validated_data)

        if line_items_data is not None:
            instance.line_items.all().delete()
            total_amount = 0
            for item_data in line_items_data:
                line_item = POLineItem.objects.create(po=instance, **item_data)
                total_amount += line_item.total

            if instance.delivery_charge:
                total_amount += Decimal(instance.delivery_charge)

            instance.total_amount = total_amount
            instance.save()

        return instance

    def get_display_po(self, obj):
        return f"PO-{obj.id:03d}"
    
class PurchaseOrderSerializer(serializers.ModelSerializer):
    line_items = POLineItemSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'project', 'supplier', 'status', 'date', 'due_date', 'total_amount', 'currency', 'delivery_charge', 'studio', 'line_items',
                  'trade_invoice', 'xero_sync', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']
        read_only_fields = ['total_amount', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        total_amount = 0
        for item_data in line_items_data:
            line_item = POLineItem.objects.create(po=purchase_order, **item_data)
            total_amount += line_item.total

        if purchase_order.delivery_charge:
            total_amount += Decimal(purchase_order.delivery_charge)
            
        purchase_order.total_amount = total_amount
        purchase_order.save()
        return purchase_order

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)

        if 'trade_invoice' in validated_data and instance.trade_invoice:
            instance.trade_invoice.delete(save=False)

        instance = super().update(instance, validated_data)

        if line_items_data is not None:
            instance.line_items.all().delete()
            total_amount = 0
            for item_data in line_items_data:
                line_item = POLineItem.objects.create(po=instance, **item_data)
                total_amount += line_item.total
                # Sync quantity and unit_price back to connected procurement entries (never touch product library price)
                if line_item.product_id:
                    Procurement.objects.filter(
                        po=instance,
                        product_id=line_item.product_id
                    ).update(quantity=line_item.quantity, unit_price=line_item.unit_price)

            if instance.delivery_charge:
                total_amount += Decimal(instance.delivery_charge)

            instance.total_amount = total_amount
            instance.save()

        return instance


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'product', 'description', 'quantity', 'unit_price', 'total', 'account_code']
        read_only_fields = ['total']

class InvoiceLineItemGetSerializer(serializers.ModelSerializer):
    """Serializer for GET requests that includes nested product details"""
    from library.models import Product
    LineItemProductSerializer.Meta.model = Product
    product = LineItemProductSerializer(read_only=True)
    
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'product', 'description', 'quantity', 'unit_price', 'total', 'account_code']
        read_only_fields = ['total']

class InvoiceGetSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemGetSerializer(many=True)
    project = ProjectSerializer(read_only=True)
    client = ClientSerializer(read_only=True)
    studio = StudioSerializer(read_only=True)
    display_invoice = serializers.SerializerMethodField()
    trade_invoices = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'project', 'client', 'status', 'date', 'due_date', 'total_amount', 'currency', 'studio', 'line_items',
                  'xero_sync', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error', 'display_invoice', 'ffne', 'delivery_charge', 'ffne_desc',
                  'trade_invoices']
        read_only_fields = ['total_amount', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']

    # def create(self, validated_data):
    #     line_items_data = validated_data.pop('line_items')
    #     invoice = Invoice.objects.create(**validated_data)
    #     total_amount = 0
    #     for item_data in line_items_data:
    #         line_item = InvoiceLineItem.objects.create(invoice=invoice, **item_data)
    #         total_amount += line_item.total
        
    #     if invoice.delivery_charge:
    #         total_amount += Decimal(invoice.delivery_charge)
    #     if invoice.ffne:
    #         total_amount += Decimal(invoice.ffne)
            
    #     invoice.total_amount = total_amount
    #     invoice.save()
    #     return invoice

    # def update(self, instance, validated_data):
    #     line_items_data = validated_data.pop('line_items', None)
    #     instance = super().update(instance, validated_data)
        
    #     if line_items_data is not None:
    #         instance.line_items.all().delete()
    #         for item_data in line_items_data:
    #             line_item = InvoiceLineItem.objects.create(invoice=instance, **item_data)
        
    #     # Recalculate total amount with line items + delivery + ffne
    #     total_amount = sum(item.total for item in instance.line_items.all())
    #     if instance.delivery_charge:
    #         total_amount += Decimal(instance.delivery_charge)
    #     if instance.ffne:
    #        total_amount += Decimal(instance.ffne)
            
    #     instance.total_amount = total_amount
    #     instance.save()
            
        # return instance
    
    def get_display_invoice(self, obj):
        return f"INV-{obj.id:03d}"

    def get_trade_invoices(self, obj):
        return [
            {
                'po_id': po.id,
                'trade_invoice': po.trade_invoice.url if po.trade_invoice else None,
            }
            for po in obj.purchase_orders.all()
        ]

class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True)
    trade_invoices = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'project', 'client', 'status', 'date', 'due_date', 'total_amount', 'currency', 'studio', 'line_items',
                  'xero_sync', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error', 'ffne', 'delivery_charge', 'ffne_desc',
                  'trade_invoices']
        read_only_fields = ['total_amount', 'xero_id', 'xero_invoice_number', 'xero_sync_status', 'xero_sync_error']

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        invoice = Invoice.objects.create(**validated_data)
        total_amount = 0
        for item_data in line_items_data:
            line_item = InvoiceLineItem.objects.create(invoice=invoice, **item_data)
            total_amount += line_item.total
        
        if invoice.delivery_charge:
            total_amount += Decimal(invoice.delivery_charge)
        if invoice.ffne:
            total_amount += Decimal(invoice.ffne)

        invoice.total_amount = total_amount
        invoice.save()
        return invoice

    def get_trade_invoices(self, obj):
        return [
            {
                'po_id': po.id,
                'trade_invoice': po.trade_invoice.url if po.trade_invoice else None,
            }
            for po in obj.purchase_orders.all()
        ]

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)
        instance = super().update(instance, validated_data)

        if line_items_data is not None:
            instance.line_items.all().delete()
            for item_data in line_items_data:
                line_item = InvoiceLineItem.objects.create(invoice=instance, **item_data)

        # Recalculate total amount with line items + delivery + ffne
        total_amount = sum(item.total for item in instance.line_items.all())
        if instance.delivery_charge:
            total_amount += Decimal(instance.delivery_charge)
        if instance.ffne:
            total_amount += Decimal(instance.ffne)

        instance.total_amount = total_amount
        instance.save()

        return instance
