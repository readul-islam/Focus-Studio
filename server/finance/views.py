from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from django.core.mail import EmailMultiAlternatives
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import date, timedelta
from decimal import Decimal
from .models import PurchaseOrder, Invoice, POLineItem, InvoiceLineItem
from projects.models import Procurement
from .serializers import PurchaseOrderGetSerializer, InvoiceGetSerializer, PurchaseOrderSerializer, InvoiceSerializer, PODownloadSerializer
from users.models import User
from users.permissions import FinanceViewPermission
from django.conf import settings
from xero.utils import sync_purchase_order_to_xero, sync_invoice_to_xero, update_xero_statuses
from email.utils import formataddr
from techstyles.mixins import StudioScopedMixin

class PurchaseOrderViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated, FinanceViewPermission]

    def get_serializer_class(self):
        """Use different serializers for read vs write operations"""
        if self.action in ['list', 'retrieve']:
            return PurchaseOrderGetSerializer
        elif self.action == 'download':
            return PODownloadSerializer
        return PurchaseOrderSerializer

    def create(self, request, *args, **kwargs):
        """Create a PurchaseOrder and optionally sync to Xero"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        purchase_order = serializer.instance
        
        # Sync to Xero if enabled and studio is connected
        if purchase_order.xero_sync and purchase_order.studio and purchase_order.studio.xero:
            purchase_order.xero_sync_status = 'pending'
            purchase_order.save()
            
            sync_result = sync_purchase_order_to_xero(purchase_order)
            
            if sync_result['success']:
                purchase_order.xero_sync_status = 'synced'
                purchase_order.xero_id = sync_result['xero_id']
                purchase_order.xero_invoice_number = sync_result['xero_invoice_number']
                purchase_order.xero_sync_error = None
            else:
                purchase_order.xero_sync_status = 'failed'
                purchase_order.xero_sync_error = sync_result['error']
            
            purchase_order.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update a PurchaseOrder and optionally sync to Xero"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Capture existing line items before update for change detection
        existing_line_items = {
            item.product_id: {
                'quantity': item.quantity,
                'unit_price': item.unit_price,
                'description': item.description,
            }
            for item in instance.line_items.all()
        }
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        purchase_order = serializer.instance

        # Detect unit_price / quantity changes and send notification email
        if 'line_items' in request.data and existing_line_items:
            changes = []
            for item in purchase_order.line_items.all():
                old = existing_line_items.get(item.product_id)
                if old and (old['quantity'] != item.quantity or old['unit_price'] != item.unit_price):
                    changes.append({
                        'product_id': item.product_id,
                        'description': item.description or old['description'],
                        'old_qty': old['quantity'],
                        'new_qty': item.quantity,
                        'old_price': old['unit_price'],
                        'new_price': item.unit_price,
                    })
            if changes:
                self._send_price_qty_change_email(purchase_order, changes)

        # Sync to Xero if enabled and studio is connected
        if purchase_order.xero_sync and purchase_order.studio and purchase_order.studio.xero:
            purchase_order.xero_sync_status = 'pending'
            purchase_order.save()
            
            sync_result = sync_purchase_order_to_xero(purchase_order)
            
            if sync_result['success']:
                purchase_order.xero_sync_status = 'synced'
                purchase_order.xero_id = sync_result['xero_id']
                purchase_order.xero_invoice_number = sync_result['xero_invoice_number']
                purchase_order.xero_sync_error = None
            else:
                purchase_order.xero_sync_status = 'failed'
                purchase_order.xero_sync_error = sync_result['error']
            
            purchase_order.save()

        return Response(serializer.data)

    def _send_price_qty_change_email(self, purchase_order, changes):
        """Collect all client-approved procurement lines affected by the PO change and
        send a single combined email rather than one email per item."""
        from projects.views import _send_bulk_procurement_change_email

        procurement_changes = []
        for c in changes:
            if not c.get('product_id'):
                continue
            qty_changed = c['old_qty'] != c['new_qty']
            price_changed = c['old_price'] != c['new_price']
            for procurement in Procurement.objects.filter(
                po=purchase_order,
                product_id=c['product_id'],
                client_approval='APR',
            ):
                procurement_changes.append((
                    procurement,
                    c['old_qty'], c['old_price'],
                    c['new_qty'], c['new_price'],
                    qty_changed, price_changed,
                ))

        if procurement_changes:
            try:
                _send_bulk_procurement_change_email(procurement_changes)
            except Exception as e:
                print(f"Error sending procurement change email from PO update: {e}")

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete purchase orders.
        Payload: {"ids": [1, 2, 3]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        purchase_orders = PurchaseOrder.objects.filter(id__in=ids, studio=self.request.user.studio)
        count = purchase_orders.count()
        purchase_orders.delete()
        
        return Response(
            {'message': f'{count} purchase orders deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='send-email')
    def send_email(self, request, pk=None):
        purchase_order = self.get_object()
        
        if not purchase_order.supplier:
            return Response(
                {'error': 'Purchase Order has no supplier assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not purchase_order.supplier.email:
            return Response(
                {'error': 'Supplier has no email address.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get HTML content and optional attachments
        html_content = request.data.get('html_content')
        cc_user_ids = request.data.get('cc_user_ids', [])
        
        if not html_content:
            return Response(
                {'error': 'html_content is required in request body.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build CC email list from user IDs
        cc_emails = []
        if cc_user_ids:
            cc_users = User.objects.filter(id__in=cc_user_ids)
            cc_emails = [user.email for user in cc_users if user.email]
        


        subject = f"Purchase Order {purchase_order.id} from {purchase_order.studio.name if purchase_order.studio else 'Focuspilot'}"

        text_body = f"""
Dear {purchase_order.supplier.name},

Please find attached Purchase Order {purchase_order.id}.

Date: {purchase_order.date}
Total Amount: {purchase_order.total_amount} {purchase_order.currency}

Items:
"""

        for item in purchase_order.line_items.all():
            text_body += f"- {item.description}: {item.quantity} x {item.unit_price} = {item.total}\n"

        text_body += f"""
Thank you,
{purchase_order.studio.name if purchase_order.studio else 'Focuspilot Team'}
"""

        try:
            from_email = formataddr((purchase_order.studio.name, settings.DEFAULT_FROM_EMAIL)) if purchase_order.studio else settings.DEFAULT_FROM_EMAIL
            
            # Add user to recipients list
            recipients = [purchase_order.supplier.email]
            if request.user.email and request.user.email not in recipients:
                recipients.append(request.user.email)

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=recipients,
                cc=cc_emails if cc_emails else None,
            )
            email.attach_alternative(html_content, "text/html")
            
            # Attach files if provided
            attached_files = []
            for file_key in request.FILES:
                for file_obj in request.FILES.getlist(file_key):
                    email.attach(
                        file_obj.name,
                        file_obj.read(),
                        file_obj.content_type
                    )
                    attached_files.append(file_obj.name)
            
            email.send(fail_silently=False)
            
            purchase_order.status = 'SNT'
            purchase_order.save()
            Procurement.objects.filter(po=purchase_order).update(po_sent=True)
            
            response_data = {
                'status': 'Email sent successfully',
                'recipient': purchase_order.supplier.email
            }
            if cc_emails:
                response_data['cc'] = cc_emails
            if attached_files:
                response_data['attachments'] = attached_files
                
            return Response(response_data, status=status.HTTP_200_OK)            
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], url_path='fetch-template')
    def fetch_template(self, request, pk=None):
        """Fetch the HTML email template for a purchase order without sending it"""
        from django.http import HttpResponse
        
        purchase_order = self.get_object()
        
        if not purchase_order.supplier:
            return Response(
                {'error': 'Purchase Order has no supplier assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        html_body = f"""
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
  </head>
  <body style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 20px;">
    <div class="container" style="background: #ffffff; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; margin-bottom: 10px;">Purchase Order #{purchase_order.id}</h2>
      
      <p>Dear <strong>{purchase_order.supplier.name}</strong>,</p>
      <p>Please find attached the purchase order details below.</p>

      <div class="details" style="margin-bottom: 20px;">
        <p><strong>Date:</strong> {purchase_order.date}</p>
        <p><strong>Total Amount:</strong> {purchase_order.total_amount} {purchase_order.currency}</p>
        <p><strong>Delivary Address:</strong></p>
      </div>

      <h3>Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <th style="background: #f3f4f6; padding: 8px; text-align: left; font-size: 14px; border: 1px solid #e1e4e8;">Description</th>
          <th style="background: #f3f4f6; padding: 8px; text-align: left; font-size: 14px; border: 1px solid #e1e4e8;">Qty</th>
          <th style="background: #f3f4f6; padding: 8px; text-align: left; font-size: 14px; border: 1px solid #e1e4e8;">Unit Price</th>
          <th style="background: #f3f4f6; padding: 8px; text-align: left; font-size: 14px; border: 1px solid #e1e4e8;">Total</th>
        </tr>
"""

        for item in purchase_order.line_items.all():
            html_body += f"""
<tr>
  <td style="padding: 8px; font-size: 14px; border: 1px solid #e1e4e8;">{item.description}</td>
  <td style="padding: 8px; font-size: 14px; border: 1px solid #e1e4e8;">{item.quantity}</td>
  <td style="padding: 8px; font-size: 14px; border: 1px solid #e1e4e8;">{item.unit_price}</td>
  <td style="padding: 8px; font-size: 14px; border: 1px solid #e1e4e8;">{item.total}</td>
</tr>
"""

        html_body += f"""
      </table>

      <p style="margin-top: 25px;">Please send us your trade invoice at your earliest convenience<br>

      <p style="margin-top: 25px;">Thank you,<br>
      <strong>{purchase_order.studio.name if purchase_order.studio else 'Focuspilot Team'}</strong></p>

      <div class="footer" style="margin-top: 30px; font-size: 13px; color: #555555; text-align: center;">
        This email was sent via Focuspilot.
      </div>
    </div>
  </body>
</html>
"""

        return HttpResponse(html_body, content_type='text/html')

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """Returns data exactly like retrieve (purchase-orders/id)"""
        return self.retrieve(request, pk)

    @action(detail=True, methods=['get'], url_path='get-addresses')
    def get_addresses(self, request, pk=None):
        """
        Get addresses related to a purchase order.

        Returns the client's address and the project's delivery and logistics
        addresses, each broken into structured fields:

        - `client_address` — object with `address_line_1`, `address_line_2`,
          `city`, `county`, `postcode`, `country` from the linked Client.
        - `delivery_address` — object with the same 6 fields from the project's
          delivery address (`delivery_address_line_1` … `delivery_country`).
        - `logistics_address` — object with the same 6 fields from the project's
          logistics address (`logistics_address_line_1` … `logistics_country`).
        """
        purchase_order = self.get_object()

        if not purchase_order.project:
            return Response(
                {'error': 'Purchase Order has no project assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        project = purchase_order.project

        def address_fields(prefix, obj):
            return {
                'address_line_1': getattr(obj, f'{prefix}address_line_1', None),
                'address_line_2': getattr(obj, f'{prefix}address_line_2', None),
                'city': getattr(obj, f'{prefix}city', None),
                'county': getattr(obj, f'{prefix}county', None),
                'postcode': getattr(obj, f'{prefix}postcode', None),
                'country': getattr(obj, f'{prefix}country', None),
            }

        client_address = None
        if project.client:
            client_address = address_fields('', project.client)

        return Response({
            'client_address': client_address,
            'delivery_address': address_fields('delivery_', project),
            'logistics_address': address_fields('logistics_', project),
        }, status=status.HTTP_200_OK)


class InvoiceViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, FinanceViewPermission]

    def get_serializer_class(self):
        """Use different serializers for read vs write operations"""
        if self.action in ['list', 'retrieve']:
            return InvoiceGetSerializer
        return InvoiceSerializer

    def create(self, request, *args, **kwargs):
        """Create an Invoice and optionally sync to Xero"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        invoice = serializer.instance
        
        # Sync to Xero if enabled and studio is connected
        if invoice.xero_sync and invoice.studio and invoice.studio.xero:
            invoice.xero_sync_status = 'pending'
            invoice.save()
            
            sync_result = sync_invoice_to_xero(invoice)
            
            if sync_result['success']:
                invoice.xero_sync_status = 'synced'
                invoice.xero_id = sync_result['xero_id']
                invoice.xero_invoice_number = sync_result['xero_invoice_number']
                invoice.xero_sync_error = None
            else:
                invoice.xero_sync_status = 'failed'
                invoice.xero_sync_error = sync_result['error']
            
            invoice.save()

        try:
            from integrations.events import notify_invoice_created
            notify_invoice_created(invoice.studio, invoice)
        except Exception:
            pass
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update an Invoice and optionally sync to Xero"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        invoice = serializer.instance
        
        # Sync to Xero if enabled and studio is connected
        if invoice.xero_sync and invoice.studio and invoice.studio.xero:
            invoice.xero_sync_status = 'pending'
            invoice.save()
            
            sync_result = sync_invoice_to_xero(invoice)
            
            if sync_result['success']:
                invoice.xero_sync_status = 'synced'
                invoice.xero_id = sync_result['xero_id']
                invoice.xero_invoice_number = sync_result['xero_invoice_number']
                invoice.xero_sync_error = None
            else:
                invoice.xero_sync_status = 'failed'
                invoice.xero_sync_error = sync_result['error']
            
            invoice.save()
        
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete invoices.
        Payload: {"ids": [1, 2, 3]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoices = Invoice.objects.filter(id__in=ids, studio=self.request.user.studio)
        count = invoices.count()
        invoices.delete()
        
        return Response(
            {'message': f'{count} invoices deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='send-invoice')
    def send_invoice(self, request, pk=None):
        """
        Mark inv_sent=True for all procurements associated with this invoice.
        Also update invoice status to 'SNT'.
        """
        invoice = self.get_object()
        
        updated_count = Procurement.objects.filter(invoice=invoice).update(inv_sent=True)
        
        invoice.status = 'SNT'
        invoice.save(update_fields=['status'])
        
        return Response(
            {'message': f'Updated inv_sent for {updated_count} procurements and set invoice status to Sent.'},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, FinanceViewPermission])
def get_studio_finance(request):
    """
    Get all PurchaseOrders and Invoices for the authenticated user's studio.
    """
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response(
            {'error': 'User is not associated with any studio'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    purchase_orders = PurchaseOrder.objects.filter(studio=user.studio)
    invoices = Invoice.objects.filter(studio=user.studio)

    # Sync statuses from Xero
    update_xero_statuses(purchase_orders)
    update_xero_statuses(invoices)
    
    po_serializer = PurchaseOrderGetSerializer(purchase_orders, many=True)
    inv_serializer = InvoiceGetSerializer(invoices, many=True)
    
    # Add inv_ref to each purchase order
    po_data = po_serializer.data
    for po in po_data:
        # Get invoices connected to this PO through procurements
        connected_invoice_ids = Procurement.objects.filter(
            po_id=po['id']
        ).values_list('invoice_id', flat=True).distinct()
        # Filter out None values and convert to list
        po['inv_ref'] = [inv_id for inv_id in connected_invoice_ids if inv_id is not None]
    
    return Response({
        'purchase_orders': po_data,
        'invoices': inv_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, FinanceViewPermission])
def get_project_finance(request):
    """
    Get all PurchaseOrders and Invoices for a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    purchase_orders = PurchaseOrder.objects.filter(project_id=project_id)
    invoices = Invoice.objects.filter(project_id=project_id)

    # Sync statuses from Xero
    update_xero_statuses(purchase_orders)
    update_xero_statuses(invoices)
    
    po_serializer = PurchaseOrderGetSerializer(purchase_orders, many=True)
    inv_serializer = InvoiceGetSerializer(invoices, many=True)
    
    # Add inv_ref to each purchase order
    po_data = po_serializer.data
    for po in po_data:
        # Get invoices connected to this PO through procurements
        connected_invoice_ids = Procurement.objects.filter(
            po_id=po['id']
        ).values_list('invoice_id', flat=True).distinct()
        # Filter out None values and convert to list
        po['inv_ref'] = [inv_id for inv_id in connected_invoice_ids if inv_id is not None]
    
    return Response({
        'purchase_orders': po_data,
        'invoices': inv_serializer.data
    }, status=status.HTTP_200_OK)

class CreatePOFromProcurementView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, FinanceViewPermission]

    @action(detail=False, methods=['post'])
    def create_po(self, request):
        procurement_ids = request.data.get('procurement_ids', [])
        xero_sync = request.data.get('xero_sync', True)
        
        if not procurement_ids:
            return Response(
                {'error': 'No procurement IDs provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        procurements = Procurement.objects.filter(id__in=procurement_ids)
        
        if len(procurements) != len(procurement_ids):
            return Response(
                {'error': 'One or more procurements not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        project_ids = procurements.values_list('project', flat=True).distinct()
        if len(project_ids) > 1:
            return Response(
                {'error': 'All procurements must belong to the same project.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project = procurements.first().project

        procurements_by_supplier = {}
        for proc in procurements:
            if not proc.product or not proc.product.supplier:
                 return Response(
                    {'error': f'Procurement {proc.id} has a product with no supplier.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            supplier_id = proc.product.supplier.id
            if supplier_id not in procurements_by_supplier:
                procurements_by_supplier[supplier_id] = []
            procurements_by_supplier[supplier_id].append(proc)

        created_pos = []

        for supplier_id, supplier_procs in procurements_by_supplier.items():
            supplier = supplier_procs[0].product.supplier
            
            purchase_order = PurchaseOrder.objects.create(
                project=project,
                supplier=supplier,
                status='DFT',
                date=date.today(),
                due_date=date.today() + timedelta(days=15),
                studio=request.user.studio,
                created_by=request.user,
                updated_by=request.user,
                xero_sync=xero_sync,
                currency=project.currency if project.currency else 'GBP'
            )

            total_amount = 0

            for proc in supplier_procs:
                product = proc.product
                price = product.tader_price if product.tader_price else product.regular_price
                if not price:
                    price = 0
                
                line_item = POLineItem.objects.create(
                    po=purchase_order,
                    product=product,
                    description=product.name,
                    quantity=proc.quantity if proc.quantity else 1,
                    unit_price=price
                )
                total_amount += line_item.total
                
                proc.po = purchase_order
                proc.status = "QT"
                proc.po_created = True
                proc.unit_price = line_item.unit_price
                proc.save()

            if purchase_order.delivery_charge:
                total_amount += Decimal(purchase_order.delivery_charge)
                
            purchase_order.total_amount = total_amount
            purchase_order.save()
            
            # Sync to Xero if enabled and studio is connected
            if purchase_order.xero_sync and request.user.studio and request.user.studio.xero:
                purchase_order.xero_sync_status = 'pending'
                purchase_order.save()
                
                sync_result = sync_purchase_order_to_xero(purchase_order)
                
                if sync_result['success']:
                    purchase_order.xero_sync_status = 'synced'
                    purchase_order.xero_id = sync_result['xero_id']
                    purchase_order.xero_invoice_number = sync_result['xero_invoice_number']
                    purchase_order.xero_sync_error = None
                else:
                    purchase_order.xero_sync_status = 'failed'
                    purchase_order.xero_sync_error = sync_result['error']
                
                purchase_order.save()
            
            created_pos.append(purchase_order)

        serializer = PurchaseOrderSerializer(created_pos, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CreateInvoiceView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, FinanceViewPermission]

    @action(detail=False, methods=['post'])
    def create_invoice(self, request):
        procurement_ids = request.data.get('procurement_ids', [])
        po_ids = request.data.get('po_ids', [])
        xero_sync = request.data.get('xero_sync', True)

        if not procurement_ids and not po_ids:
            return Response(
                {'error': 'Either procurement_ids or po_ids must be provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        procurements = Procurement.objects.none()

        if procurement_ids:
            procurements = procurements | Procurement.objects.filter(id__in=procurement_ids)

        if po_ids:
            procurements = procurements | Procurement.objects.filter(po__in=po_ids)

        procurements = procurements.distinct().select_related('po')

        # Calculate delivery charge from POs
        total_delivery_charge = 0
        if po_ids:
            total_delivery_charge = PurchaseOrder.objects.filter(id__in=po_ids).aggregate(
                total=models.Sum('delivery_charge')
            )['total'] or 0

        if not procurements.exists():
             return Response(
                {'error': 'No procurements found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        project_ids = procurements.values_list('project', flat=True).distinct()
        if len(project_ids) > 1:
            return Response(
                {'error': 'All procurements must belong to the same project.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project = procurements.first().project
        
        if not project.client:
             return Response(
                {'error': 'Project has no client assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice = Invoice.objects.create(
            project=project,
            client=project.client,
            status='DFT',
            date=date.today(),
            due_date=date.today() + timedelta(days=15),
            studio=request.user.studio,
            created_by=request.user,
            updated_by=request.user,
            xero_sync=xero_sync,
            currency=project.currency if project.currency else 'GBP',
            delivery_charge=total_delivery_charge
        )

        product_total = 0
        po_line_items = {}
        if po_ids:
            # Pre-fetch PO line items for efficient lookup
            items = POLineItem.objects.filter(po_id__in=po_ids)
            for item in items:
                po_line_items[(item.po_id, item.product_id)] = item.unit_price

        for proc in procurements:
            product = proc.product
            price = None
            
            # If po_ids are provided, prioritize price from the PO line item
            if po_ids and proc.po_id in po_ids:
                price = po_line_items.get((proc.po_id, product.id))
            
            # Fallback to product library price
            if price is None:
                price = product.regular_price if product.regular_price else product.tader_price
            
            if not price:
                price = 0
            
            line_item = InvoiceLineItem.objects.create(
                invoice=invoice,
                product=product,
                description=product.name,
                quantity=proc.quantity if proc.quantity else 1,
                unit_price=price
            )
            product_total += line_item.total
            
            proc.invoice = invoice
            proc.inv_created = True
            proc.save()

        product_total = round(product_total, 2)

        # Calculate FF&E
        ffne_amount = 0
        if project.ffne:
            ffne_amount = float(product_total) * (project.ffne / 100.0)
            invoice.ffne = ffne_amount
            invoice.ffne_desc = f"Project FF&E {project.ffne}% of {product_total}"

        # Update total amount (products + ffne + delivery)
        total_amount = float(product_total) + ffne_amount
        
        if invoice.delivery_charge:
            total_amount += invoice.delivery_charge

        invoice.total_amount = total_amount
        invoice.save()

        procurements.update(status="QT", inv_created=True, invoice=invoice)
        
        # Sync to Xero if enabled and studio is connected
        if invoice.xero_sync and request.user.studio and request.user.studio.xero:
            invoice.xero_sync_status = 'pending'
            invoice.save()
            
            sync_result = sync_invoice_to_xero(invoice)
            
            if sync_result['success']:
                invoice.xero_sync_status = 'synced'
                invoice.xero_id = sync_result['xero_id']
                invoice.xero_invoice_number = sync_result['xero_invoice_number']
                invoice.xero_sync_error = None
            else:
                invoice.xero_sync_status = 'failed'
                invoice.xero_sync_error = sync_result['error']
            
            invoice.save()

        # Collect all POs linked to this invoice (from po_ids + procurements that have a PO)
        linked_po_ids = set(po_ids or [])
        for proc in procurements:
            if proc.po_id:
                linked_po_ids.add(proc.po_id)

        if linked_po_ids:
            from .models import PurchaseOrder as PO
            linked_pos = PO.objects.filter(id__in=linked_po_ids)
            invoice.purchase_orders.set(linked_pos)

            trade_invoices = [
                {
                    'po_id': po.id,
                    'trade_invoice': po.trade_invoice.url if po.trade_invoice else None,
                }
                for po in linked_pos
            ]
        else:
            trade_invoices = []

        try:
            from integrations.events import notify_invoice_created
            notify_invoice_created(request.user.studio, invoice)
        except Exception:
            pass

        serializer = InvoiceSerializer(invoice)
        data = serializer.data
        data['trade_invoices'] = trade_invoices
        return Response(data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, FinanceViewPermission])
def stripe_connect_status(request):
    studio = request.user.studio
    if not studio:
        return Response({'detail': 'No studio associated with user.'}, status=status.HTTP_400_BAD_REQUEST)
    from .stripe_connect import connect_status
    payload = connect_status(studio, fallback_email=request.user.email)
    return Response(payload)


@api_view(['POST'])
@permission_classes([IsAuthenticated, FinanceViewPermission])
def stripe_connect_sync(request):
    """Refresh Connect account state after Stripe redirect."""
    studio = request.user.studio
    if not studio:
        return Response({'detail': 'No studio associated with user.'}, status=status.HTTP_400_BAD_REQUEST)
    from .stripe_connect import connect_status
    payload = connect_status(studio, fallback_email=request.user.email)
    return Response(payload)


@api_view(['POST'])
@permission_classes([IsAuthenticated, FinanceViewPermission])
def stripe_connect_onboard(request):
    studio = request.user.studio
    if not studio:
        return Response({'detail': 'No studio associated with user.'}, status=status.HTTP_400_BAD_REQUEST)
    from .stripe_connect import create_onboarding_link, stripe_configured
    if not stripe_configured():
        return Response({'detail': 'Stripe is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    email = (request.data.get('email') or request.user.email or '').strip()
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        url = create_onboarding_link(studio=studio, user_email=email)
    except Exception as exc:
        logger = __import__('logging').getLogger(__name__)
        logger.exception('Stripe Connect onboarding failed')
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
    return Response({'url': url})
