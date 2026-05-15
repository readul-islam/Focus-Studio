from unittest.mock import patch, MagicMock
from django.test import RequestFactory
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from .models import XeroToken
from .views import xero_callback


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="user@example.com", password="pass1234!", studio=None, role="admin"):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Test User"
    user.studio = studio
    user.role = role
    user.save()
    return user


class XeroCallbackTests(APITestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_xero_callback_error(self):
        request = self.factory.get(
            '/xero/xero/callback/',
            {'error': 'access_denied', 'error_description': 'TenantConsent status DENIED'},
        )
        response = xero_callback(request)
        self.assertEqual(response.status_code, 302)
        self.assertIn('status=error', response['Location'])

    def test_xero_callback_no_code(self):
        request = self.factory.get('/xero/xero/callback/')
        response = xero_callback(request)
        self.assertEqual(response.status_code, 302)
        self.assertIn('status=error', response['Location'])

    @patch('xero.views.requests.post')
    def test_xero_callback_token_exchange_failure(self, mock_post):
        mock_post.return_value = MagicMock(status_code=400, text="Bad Request")
        request = self.factory.get('/xero/xero/callback/', {'code': 'test_code', 'state': 'invalid_nonce'})
        response = xero_callback(request)
        self.assertEqual(response.status_code, 302)
        self.assertIn('status=error', response['Location'])


class XeroDisconnectTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_disconnect_xero_no_token(self):
        response = self.client.post('/xero/xero/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_disconnect_xero_removes_token(self):
        XeroToken.objects.create(
            studio=self.studio,
            access_token="tok",
            refresh_token="ref",
            expires_at=timezone.now(),
        )
        self.studio.xero = True
        self.studio.save()

        response = self.client.post('/xero/xero/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(XeroToken.objects.filter(studio=self.studio).count(), 0)
        self.studio.refresh_from_db()
        self.assertFalse(self.studio.xero)

    def test_disconnect_xero_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/xero/xero/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_disconnect_xero_user_without_studio(self):
        user_no_studio = create_user(email="nostudio@example.com")
        self.client.force_authenticate(user=user_no_studio)
        response = self.client.post('/xero/xero/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class XeroPushInvoiceTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.invoice_payload = {
            "type": "ACCREC",
            "status": "DRAFT",
            "contact": "Test Client",
            "date": {"year": "2025", "month": "01", "day": "01"},
            "due_date": {"year": "2025", "month": "02", "day": "01"},
            "currency_code": "GBP",
            "line_items": [
                {
                    "description": "Design Work",
                    "quantity": 1,
                    "unit_amount": 500.0,
                    "account_code": "200",
                }
            ],
        }

    def test_push_invoice_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/xero/invoice/push/', self.invoice_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('xero.views.setup_xero_client')
    @patch('xero.views.get_tenant_id')
    @patch('xero.views.AccountingApi')
    def test_push_invoice_success(self, mock_api_class, mock_tenant, mock_client):
        mock_tenant.return_value = 'tenant-123'
        mock_api = MagicMock()
        mock_api_class.return_value = mock_api
        mock_result = MagicMock()
        mock_result.invoices = [MagicMock(invoice_id='inv-1', invoice_number='INV-001')]
        mock_api.create_invoices.return_value = mock_result

        response = self.client.post('/xero/invoice/push/', self.invoice_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('invoice_id', response.data)

    @patch('xero.views.setup_xero_client', side_effect=Exception("No token"))
    def test_push_invoice_xero_error(self, mock_client):
        response = self.client.post('/xero/invoice/push/', self.invoice_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_push_invoice_missing_required_fields(self):
        response = self.client.post('/xero/invoice/push/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class XeroPushBillTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.bill_payload = {
            "type": "ACCPAY",
            "status": "DRAFT",
            "contact": "Supplier Ltd",
            "date": {"year": "2025", "month": "01", "day": "01"},
            "due_date": {"year": "2025", "month": "02", "day": "01"},
            "currency_code": "GBP",
            "line_items": [
                {
                    "description": "Materials",
                    "quantity": 2,
                    "unit_amount": 100.0,
                    "account_code": "300",
                }
            ],
        }

    def test_push_bill_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/xero/bill/push/', self.bill_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('xero.views.setup_xero_client', side_effect=Exception("No token"))
    def test_push_bill_xero_error(self, mock_client):
        response = self.client.post('/xero/bill/push/', self.bill_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class XeroInvoiceStatusTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_get_invoice_status_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/xero/invoice/abc-123/status/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('xero.views.setup_xero_client', side_effect=Exception("No token"))
    def test_get_invoice_status_xero_error(self, mock_client):
        response = self.client.get('/xero/invoice/abc-123/status/')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @patch('xero.views.setup_xero_client')
    @patch('xero.views.get_tenant_id')
    @patch('xero.views.AccountingApi')
    def test_get_invoice_status_success(self, mock_api_class, mock_tenant, mock_xero_client):
        mock_tenant.return_value = 'tenant-123'
        mock_api = MagicMock()
        mock_api_class.return_value = mock_api
        mock_invoice = MagicMock(status='AUTHORISED', invoice_number='INV-001')
        mock_api.get_invoice.return_value = MagicMock(invoices=[mock_invoice])

        response = self.client.get('/xero/invoice/abc-123/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
