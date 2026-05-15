from xero_python.api_client import ApiClient, Configuration
from xero_python.api_client.oauth2 import OAuth2Token
from xero_python.identity import IdentityApi
from xero_python.accounting import AccountingApi
from xero_python.accounting.models import Invoice as XeroInvoice, LineItem, Invoices, Contact, CurrencyCode
from xero_python.exceptions import ApiException 
from .models import XeroToken
from django.conf import settings
from django.utils import timezone

CLIENT_ID = settings.XERO_CLIENT_ID
CLIENT_SECRET = settings.XERO_CLIENT_SECRET
REDIRECT_URI = settings.XERO_REDIRECT_URI
SCOPE = settings.XERO_SCOPE

def ex_vat(amount):
    """Strip 20% VAT from a VAT-inclusive amount."""
    return round(float(amount) / 1.20, 2)

def setup_xero_client(studio_id: int):
    """Setup Xero API client for a given studio"""
    def oauth2_token_getter():
        token = XeroToken.objects.get(studio__id=studio_id)
        return {
            "access_token": token.access_token,
            "expires_at": token.expires_at.timestamp(),
            "expires_in": int((token.expires_at - timezone.now()).total_seconds()),
            "token_type": "Bearer", 
            "scope": SCOPE, 
            "refresh_token": token.refresh_token 
        }
   
    def oauth2_token_saver(token):
        print(f"Refreshing and saving new Xero token for studio {studio_id}")
        # Convert timestamp to datetime if present
        expires_at = None
        if 'expires_at' in token:
            from datetime import datetime, timezone as dt_timezone
            expires_at = datetime.fromtimestamp(token['expires_at'], tz=dt_timezone.utc)
        
        defaults = {
            "access_token": token.get("access_token"),
            "refresh_token": token.get("refresh_token"),
            "token_type": token.get("token_type", "Bearer"),
        }
        if expires_at:
            defaults["expires_at"] = expires_at

        XeroToken.objects.update_or_create(
            studio_id=studio_id,
            defaults=defaults
        )
   
    config = Configuration(
        debug=False,
        oauth2_token=OAuth2Token(
            client_id=CLIENT_ID, 
            client_secret=CLIENT_SECRET
        ),
    )

    api_client = ApiClient(
        config,
        pool_threads=1,
        oauth2_token_getter=oauth2_token_getter,
        oauth2_token_saver=oauth2_token_saver,
    )

    return api_client


def get_auth_url(api_client: ApiClient, state: str) -> str:
    """Get Xero authorization URL"""
    return api_client.get_oauth2_service().get_authorization_url(
        client_id=CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
        state=state
    )

def get_tenant_id(studio_id: int) -> str:
    """Get Xero tenant ID for a studio"""
    xero_client = setup_xero_client(studio_id)
    identity_api = IdentityApi(xero_client)
    
    connections = identity_api.get_connections()

    if not connections:
        raise ApiException(f"No Xero tenant connected for studio {studio_id}. Please re-authenticate.")
        
    return connections[0].tenant_id


def get_xero_contact_name(client):
    """
    Get a valid name for a Xero contact.
    Prioritizes client.name, then client.company_name,
    then falls back to a generic identifier.
    """
    if not client:
        return "Unknown Contact"
        
    if client.name and client.name.strip():
        return client.name.strip()
        
    if client.company_name and client.company_name.strip():
        return client.company_name.strip()
        
    # Fallback to display name or generic type + id
    try:
        contact_type = client.get_contact_type_display()
    except:
        contact_type = "Contact"
        
    return f"{contact_type} #{client.id}"


def sync_purchase_order_to_xero(purchase_order):
    """
    Sync a PurchaseOrder to Xero as a bill (ACCPAY).
    
    Args:
        purchase_order: PurchaseOrder instance
        
    Returns:
        dict: {'success': bool, 'xero_id': str, 'xero_invoice_number': str, 'error': str}
    """
    try:
        if not purchase_order.studio:
            return {
                'success': False,
                'error': 'Purchase Order has no studio assigned'
            }
        
        if not purchase_order.supplier:
            return {
                'success': False,
                'error': 'Purchase Order has no supplier assigned'
            }
        
        # Setup Xero client
        xero_client = setup_xero_client(purchase_order.studio.id)
        tenant_id = get_tenant_id(purchase_order.studio.id)
        
        # Create contact
        contact_name = get_xero_contact_name(purchase_order.supplier)
        contact = Contact(name=contact_name)
        
        # Create line items — unit_amount sent ex-VAT (prices stored VAT-inclusive)
        xero_line_items = []
        for item in purchase_order.line_items.all():
            xero_line_items.append(
                LineItem(
                    description=item.description,
                    quantity=float(item.quantity),
                    unit_amount=ex_vat(item.unit_price),
                    account_code=item.account_code,
                )
            )

        if purchase_order.delivery_charge and purchase_order.delivery_charge > 0:
            xero_line_items.append(
                LineItem(
                    description="Delivery Charge",
                    quantity=1.0,
                    unit_amount=ex_vat(purchase_order.delivery_charge),
                    account_code="200",
                )
            )

        # Create bill (ACCPAY invoice)
        invoice = XeroInvoice(
            type='ACCPAY',
            contact=contact,
            invoice_number=f"PO-{purchase_order.id}",
            date=purchase_order.date,
            due_date=purchase_order.due_date,
            line_items=xero_line_items,
            status="DRAFT",
            currency_code=CurrencyCode(purchase_order.currency),
            invoice_id=purchase_order.xero_id if purchase_order.xero_id else None
        )
        
        if purchase_order.xero_id:
            # Update existing bill
            invoice.invoice_id = purchase_order.xero_id
            
            accounting_api = AccountingApi(xero_client)
            result = accounting_api.update_invoice(
                xero_tenant_id=tenant_id,
                invoice_id=purchase_order.xero_id,
                invoices=Invoices(invoices=[invoice])
            )
            
            # update_invoice returns a list of invoices (usually just one)
            if result.invoices and len(result.invoices) > 0:
                 return {
                    'success': True,
                    'xero_id': str(result.invoices[0].invoice_id),
                    'xero_invoice_number': result.invoices[0].invoice_number,
                    'error': None
                }
            else:
                 return {
                    'success': True, # It might not return the invoice object on update depending on API version, but no exception means success
                    'xero_id': purchase_order.xero_id, 
                    'xero_invoice_number': purchase_order.xero_invoice_number,
                    'error': None
                }
        else:
            # Create new bill
            accounting_api = AccountingApi(xero_client)
            result = accounting_api.create_invoices(
                xero_tenant_id=tenant_id,
                invoices=Invoices(invoices=[invoice])
            )
            
            if result.invoices and len(result.invoices) > 0:
                return {
                    'success': True,
                    'xero_id': str(result.invoices[0].invoice_id),
                    'xero_invoice_number': result.invoices[0].invoice_number,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'error': 'No invoice returned from Xero'
                }
            
    except XeroToken.DoesNotExist:
        return {
            'success': False,
            'error': f'No Xero token found for studio {purchase_order.studio.id}. Please connect to Xero first.'
        }
    except ApiException as e:
        return {
            'success': False,
            'error': f'Xero API Error: {e.reason}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }


def sync_invoice_to_xero(invoice):
    """
    Sync an Invoice to Xero as an invoice (ACCREC).
    
    Args:
        invoice: Invoice instance
        
    Returns:
        dict: {'success': bool, 'xero_id': str, 'xero_invoice_number': str, 'error': str}
    """
    try:
        if not invoice.studio:
            return {
                'success': False,
                'error': 'Invoice has no studio assigned'
            }
        
        if not invoice.client:
            return {
                'success': False,
                'error': 'Invoice has no client assigned'
            }
        
        # Setup Xero client
        xero_client = setup_xero_client(invoice.studio.id)
        tenant_id = get_tenant_id(invoice.studio.id)
        
        # Create contact
        contact_name = get_xero_contact_name(invoice.client)
        contact = Contact(name=contact_name)
        
        # Create line items — unit_amount sent ex-VAT (prices stored VAT-inclusive)
        xero_line_items = []
        for item in invoice.line_items.all():
            xero_line_items.append(
                LineItem(
                    description=item.description,
                    quantity=float(item.quantity),
                    unit_amount=ex_vat(item.unit_price),
                    account_code=item.account_code,
                )
            )

        if invoice.ffne and invoice.ffne > 0:
            xero_line_items.append(
                LineItem(
                    description=invoice.ffne_desc if invoice.ffne_desc else "FF&E",
                    quantity=1.0,
                    unit_amount=ex_vat(invoice.ffne),
                    account_code="200",
                )
            )

        if invoice.delivery_charge and invoice.delivery_charge > 0:
            xero_line_items.append(
                LineItem(
                    description="Delivery Charge",
                    quantity=1.0,
                    unit_amount=ex_vat(invoice.delivery_charge),
                    account_code="200",
                )
            )
        
        # Create invoice (ACCREC)
        xero_invoice = XeroInvoice(
            type='ACCREC',
            contact=contact,
            invoice_number=f"INV-{invoice.id}",
            date=invoice.date,
            due_date=invoice.due_date,
            line_items=xero_line_items,
            status="DRAFT",
            currency_code=CurrencyCode(invoice.currency),
            invoice_id=invoice.xero_id if invoice.xero_id else None
        )
        
        # Push to Xero
        accounting_api = AccountingApi(xero_client)
        
        if invoice.xero_id:
            # Update existing invoice
            xero_invoice.invoice_id = invoice.xero_id
            
            result = accounting_api.update_invoice(
                xero_tenant_id=tenant_id,
                invoice_id=invoice.xero_id,
                invoices=Invoices(invoices=[xero_invoice])
            )
            
            if result.invoices and len(result.invoices) > 0:
                 return {
                    'success': True,
                    'xero_id': str(result.invoices[0].invoice_id),
                    'xero_invoice_number': result.invoices[0].invoice_number,
                    'error': None
                }
            else:
                 return {
                    'success': True,
                    'xero_id': invoice.xero_id, 
                    'xero_invoice_number': invoice.xero_invoice_number,
                    'error': None
                }
        else:
            # Create new invoice
            result = accounting_api.create_invoices(
                xero_tenant_id=tenant_id,
                invoices=Invoices(invoices=[xero_invoice])
            )
        
            if result.invoices and len(result.invoices) > 0:
                return {
                    'success': True,
                    'xero_id': str(result.invoices[0].invoice_id),
                    'xero_invoice_number': result.invoices[0].invoice_number,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'error': 'No invoice returned from Xero'
                }
            
    except XeroToken.DoesNotExist:
        return {
            'success': False,
            'error': f'No Xero token found for studio {invoice.studio.id}. Please connect to Xero first.'
        }
    except ApiException as e:
        return {
            'success': False,
            'error': f'Xero API Error: {e.reason}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }

def update_xero_statuses(objects):
    """
    Update the status of local PurchaseOrder or Invoice objects from Xero.
    Skips objects that are already paid locally or have sync disabled.
    """
    if not objects:
        return

    # Group objects by studio
    objects_by_studio = {}
    for obj in objects:
        if not obj.xero_sync or not obj.xero_id or not obj.studio:
            continue
        
        # Skip if already paid
        if obj.status == 'PD':
            continue

        if obj.studio.id not in objects_by_studio:
            objects_by_studio[obj.studio.id] = []
        objects_by_studio[obj.studio.id].append(obj)

    for studio_id, studio_objects in objects_by_studio.items():
        try:
            xero_client = setup_xero_client(studio_id)
            tenant_id = get_tenant_id(studio_id)
            accounting_api = AccountingApi(xero_client)

            # Xero allows filtering by IDs (comma separated)
            # We should chunk this if there are many, but reasonable limits (e.g. < 50) are usually fine
            # For robustness, let's just do it in one go assuming user volume isn't massive per request yet
            xero_ids = [obj.xero_id for obj in studio_objects]
            
            if not xero_ids:
                continue

            # API expects list of IDs
            xero_invoices = accounting_api.get_invoices(
                xero_tenant_id=tenant_id, 
                i_ds=xero_ids
            )
            
            if not xero_invoices.invoices:
                continue

            # Map Xero invoices by ID for easy lookup
            xero_map = {inv.invoice_id: inv for inv in xero_invoices.invoices}

            for obj in studio_objects:
                xero_inv = xero_map.get(obj.xero_id)
                if not xero_inv:
                    continue

                xero_status = xero_inv.status
                new_status = obj.status
                
                # Map Xero status to local status
                if xero_status == 'PAID':
                    new_status = 'PD'
                elif xero_status == 'AUTHORISED':
                    # PurchaseOrder uses 'APR', Invoice uses 'SNT' (conceptually 'Approved/Sent')
                    # We need to distinguish model type or just check choices, or infer
                    # Safe inference:
                    if hasattr(obj, 'supplier'): # It's a PurchaseOrder
                        new_status = 'APR'
                    else: # It's an Invoice
                        new_status = 'SNT'
                elif xero_status == 'SUBMITTED':
                     # Typically 'Awaiting Approval'
                    new_status = 'SNT'
                # DRAFT remains DRAFT (DFT), VOIDED might be relevant but not in our spec
                
                if new_status != obj.status:
                    obj.status = new_status
                    obj.save(update_fields=['status'])

                    # Update Procurement fields
                    from projects.models import Procurement
                    
                    if hasattr(obj, 'supplier'): # PurchaseOrder
                        if new_status in ['PD']:
                            procurement_update_fields = {
                                'po_received': True,
                                'status': 'ORD'
                            }
                            
                            # Get payment date if paid
                            if new_status == 'PD' and hasattr(xero_inv, 'fully_paid_on_date'):
                                payment_date = xero_inv.fully_paid_on_date
                                if payment_date:
                                    procurement_update_fields['order_date'] = payment_date
                            
                            Procurement.objects.filter(po=obj).update(**procurement_update_fields)
                    else: # Invoice
                        if new_status == 'PD':
                            Procurement.objects.filter(invoice=obj).update(inv_received=True)

        except Exception as e:
            print(f"Failed to sync Xero statuses for studio {studio_id}: {e}")
            # We silently fail here to not block the read operation, 
            # but logging would be good. For now just print.
            continue
