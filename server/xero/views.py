import secrets
from datetime import timedelta
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseRedirect
from users.models import Studio, User
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
from .serializers import InvoiceSerializer
from .utils import setup_xero_client, get_tenant_id
from .models import XeroToken
from xero_python.accounting import AccountingApi
from xero_python.accounting.models import Invoice, LineItem, Invoices, Contact, CurrencyCode
from xero_python.exceptions import ApiException
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def xero_connect(request):
    client_id = settings.XERO_CLIENT_ID
    redirect_uri = settings.XERO_REDIRECT_URI
    scopes = settings.XERO_SCOPE

    try:
        studio_id = User.objects.get(id=request.GET.get("user_id")).studio.id
    except (User.DoesNotExist, AttributeError):
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    nonce = secrets.token_urlsafe(32)
    cache.set(f"oauth_state:{nonce}", studio_id, timeout=600)

    auth_url = (
        f"https://login.xero.com/identity/connect/authorize"
        f"?response_type=code"
        f"&client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope={scopes}"
        f"&state={nonce}"
    )
    return HttpResponseRedirect(auth_url)


def xero_callback(request):
    error = request.GET.get("error")
    if error:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    code = request.GET.get("code")
    if not code:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    # Verify CSRF state nonce
    nonce = request.GET.get("state", "")
    studio_id = cache.get(f"oauth_state:{nonce}")
    if not studio_id:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    cache.delete(f"oauth_state:{nonce}")

    try:
        studio = Studio.objects.get(id=studio_id)
    except Studio.DoesNotExist:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    token_url = "https://identity.xero.com/connect/token"
    data = {"grant_type": "authorization_code", "code": code, "redirect_uri": settings.XERO_REDIRECT_URI}
    auth = (settings.XERO_CLIENT_ID, settings.XERO_CLIENT_SECRET)
    r = requests.post(token_url, data=data, auth=auth)

    if r.status_code != 200:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/oauth/xero/callback?status=error")

    token_data = r.json()
    XeroToken.objects.update_or_create(
        studio=studio,
        defaults={
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "expires_at": timezone.now() + timedelta(seconds=token_data.get("expires_in")),
            "id_token": token_data.get("id_token", ""),
            "token_type": token_data.get("token_type", "Bearer"),
        },
    )
    
    studio.xero = True
    studio.save()

    frontend_url = f"{settings.FRONTEND_URL}/oauth/xero/callback?status=success"
    return HttpResponseRedirect(frontend_url)


@api_view(['POST'])
def push_invoice(request):

    user_id = request.user.id
    
    serializer = InvoiceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        xero_client = setup_xero_client(user_id=user_id)
        tenant_id = get_tenant_id(user_id=user_id)
        
        contact_name = data['contact']
        contact = Contact(name=contact_name)

        xero_line_items = [
            LineItem(
                description=item['description'],
                quantity=item['quantity'],
                unit_amount=item['unit_amount'],
                account_code=item['account_code'],
            )
            for item in data.get('line_items', [])
        ]
    

        invoice = Invoice(
            type='ACCREC',
            contact=contact,
            invoice_number=data.get('invoice_number'),
            date=data['date'],
            due_date=data['due_date'],
            reference=data.get('reference'),
            line_items=xero_line_items,
            status=data.get('status', "DRAFT"),
            currency_code=CurrencyCode(data.get("currency_code"))
        )

        accounting_api = AccountingApi(xero_client)
        result = accounting_api.create_invoices(
            xero_tenant_id=tenant_id, 
            invoices=Invoices(invoices=[invoice])
        )
        
        return Response({
            "message": "Invoice pushed successfully!",
            "invoice_id": result.invoices[0].invoice_id if result.invoices else None,
            "invoice_number": result.invoices[0].invoice_number if result.invoices else None,
        })
        
    except Exception as e:
        return Response({"error": f"Failed to push invoice: {e}"}, status=500)


@api_view(['POST'])
def push_bill(request):
    user_id = request.user.id
    
    serializer = InvoiceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        xero_client = setup_xero_client(user_id=user_id)
        tenant_id = get_tenant_id(user_id=user_id)
        
        contact_name = data['contact']
        contact = Contact(name=contact_name)

        xero_line_items = [
            LineItem(
                description=item['description'],
                quantity=item['quantity'],
                unit_amount=item['unit_amount'],
                account_code=item['account_code'],
            )
            for item in data.get('line_items', [])
        ]
    

        invoice = Invoice(
            type='ACCPAY',
            contact=contact,
            invoice_number=data.get('invoice_number'),
            date=data['date'],
            due_date=data['due_date'],
            reference=data.get('reference'),
            line_items=xero_line_items,
            status=data.get('status', "DRAFT"),
            currency_code=CurrencyCode(data.get("currency_code"))
        )

        accounting_api = AccountingApi(xero_client)
        result = accounting_api.create_invoices(
            xero_tenant_id=tenant_id, 
            invoices=Invoices(invoices=[invoice])
        )
        
        return Response({
            "message": "Invoice pushed successfully!",
            "bill_id": result.invoices[0].invoice_id if result.invoices else None,
            "invoice_number": result.invoices[0].invoice_number if result.invoices else None,
        })
        
    except Exception as e:
        return Response({"error": f"Failed to push invoice: {e}"}, status=500)



@api_view(['GET'])
def get_invoice_status(request, invoice_id):
    user_id = request.user.id
    
    try:
        xero_client = setup_xero_client(user_id=user_id)
        tenant_id = get_tenant_id(user_id=user_id)
        accounting_api = AccountingApi(xero_client)
        invoice = accounting_api.get_invoice(xero_tenant_id=tenant_id, invoice_id=invoice_id)
        return Response({"status": invoice.invoices[0].status, "invoice_number": f"{invoice.invoices[0].invoice_number}"})
        
    except ApiException as e:
        if hasattr(e, 'status') and e.status == 401:
            return HttpResponseRedirect(xero_connect(request).url)
        return Response({"error": f"Xero API Error: {e.reason}", "detail": str(e)},
                        status=e.status if hasattr(e, 'status') else 500
                    )
    except Exception as e:
        return Response({"error": "Internal Server Error", "detail": str(e)},
                        status=500
                    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_xero(request):
    """Disconnect Xero by deleting the token and updating studio status"""
    studio = request.user.studio
    if not studio:
        return Response({"error": "User has no studio associated."}, status=400)
    
    deleted_count, _ = XeroToken.objects.filter(studio=studio).delete()
    
    studio.xero = False
    studio.save()
    
    return Response({"message": f"Successfully disconnected Xero. {deleted_count} token(s) removed."})


@api_view(['GET'])
def get_bill_status(request, bill_id):
    user_id = request.user.id
    
    try:
        xero_client = setup_xero_client(user_id=user_id)
        tenant_id = get_tenant_id(user_id=user_id)
        accounting_api = AccountingApi(xero_client)
        bill = accounting_api.get_invoice(xero_tenant_id=tenant_id, invoice_id=bill_id)
        print(bill)
        return Response({"status": bill.invoices[0].status, "po_number": f"{bill.invoices[0].invoice_number}"})
        
    except ApiException as e:
        if hasattr(e, 'status') and e.status == 401:
            return HttpResponseRedirect(xero_connect(request).url)
        return Response({"error": f"Xero API Error: {e.reason}", "detail": str(e)},
                        status=e.status if hasattr(e, 'status') else 500
                    )
    except Exception as e:
        return Response({"error": "Internal Server Error", "detail": str(e)},
                        status=500
                    )