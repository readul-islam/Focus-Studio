from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from projects.models import Procurement, Project
from users.models import Studio, User

from .models import CatalogProduct, SupplierAccount, SupplierOrderLine


class SupplierPortalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.studio = Studio.objects.create(name='Vivid Studio')
        self.user = User.objects.create_user(
            email='owner@test.com',
            password='pass12345',
            studio=self.studio,
        )
        self.supplier = SupplierAccount.objects.create(
            company_name='Nordic Lighting Co',
            email='supplier@test.com',
            is_verified=True,
        )
        self.supplier.set_password('supplier123')
        self.supplier.save()

        self.product = CatalogProduct.objects.create(
            supplier=self.supplier,
            name='Arc Floor Lamp',
            trade_price='450.00',
            currency='GBP',
            is_published=True,
        )

        self.project = Project.objects.create(
            project_name='Mayfair Apartment',
            studio=self.studio,
            delivery_address_line_1='12 Park Lane',
            delivery_city='London',
            delivery_postcode='W1K 1QA',
            delivery_country='UK',
        )

    def test_supplier_login(self):
        response = self.client.post(
            '/supplier_portal/login/',
            {'email': 'supplier@test.com', 'password': 'supplier123'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['supplier']['company_name'], 'Nordic Lighting Co')

    def test_browse_catalog_requires_studio_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/supplier_portal/catalog/browse/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Arc Floor Lamp')

    def test_add_catalog_product_to_project_creates_order_line(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            '/supplier_portal/catalog/add-to-project/',
            {
                'catalog_product_id': self.product.id,
                'project_id': self.project.id,
                'quantity': 2,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(SupplierOrderLine.objects.filter(supplier=self.supplier).exists())
        order = SupplierOrderLine.objects.get(supplier=self.supplier)
        self.assertEqual(order.delivery_city, 'London')
        self.assertEqual(order.quantity, 2)

    def test_supplier_dashboard(self):
        Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=1,
            unit_price=self.product.trade_price,
        )

        login = self.client.post(
            '/supplier_portal/login/',
            {'email': 'supplier@test.com', 'password': 'supplier123'},
            format='json',
        )
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/supplier_portal/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['summary']['total_orders'], 1)

    def test_supplier_analytics(self):
        Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=2,
            unit_price=self.product.trade_price,
        )

        login = self.client.post(
            '/supplier_portal/login/',
            {'email': 'supplier@test.com', 'password': 'supplier123'},
            format='json',
        )
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/supplier_portal/analytics/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('top_products', response.data)
        self.assertIn('studio_breakdown', response.data)
        self.assertEqual(response.data['summary']['month_orders'], 1)
        self.assertGreater(response.data['summary']['month_revenue'], 0)

    @patch('supplier_portal.views.send_supplier_application_received_email')
    def test_supplier_register(self, mock_email):
        response = self.client.post(
            '/supplier_portal/register/',
            {
                'company_name': 'New Trade Co',
                'contact_name': 'Jane Supplier',
                'email': 'newsupplier@test.com',
                'password': 'securepass123',
                'country': 'UK',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        supplier = SupplierAccount.objects.get(email='newsupplier@test.com')
        self.assertFalse(supplier.is_verified)
        self.assertTrue(supplier.check_password('securepass123'))
        mock_email.assert_called_once()

    @patch('supplier_portal.emails.send_supplier_new_order_email')
    def test_new_order_sends_supplier_email(self, mock_email):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            '/supplier_portal/catalog/add-to-project/',
            {
                'catalog_product_id': self.product.id,
                'project_id': self.project.id,
                'quantity': 1,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        mock_email.assert_called_once()

    def test_unverified_supplier_cannot_publish(self):
        unverified = SupplierAccount.objects.create(
            company_name='Pending Co',
            email='pending@test.com',
            is_verified=False,
        )
        unverified.set_password('pending123')
        unverified.save()

        login = self.client.post(
            '/supplier_portal/login/',
            {'email': 'pending@test.com', 'password': 'pending123'},
            format='json',
        )
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/supplier_portal/products/',
            {
                'name': 'Draft Chair',
                'currency': 'GBP',
                'is_published': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    @patch('supplier_portal.emails.send_studio_supplier_payment_confirmation_email')
    @patch('supplier_portal.emails.send_supplier_payment_received_email')
    def test_mark_supplier_order_paid_sends_emails(self, mock_supplier_email, mock_studio_email):
        procurement = Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=1,
            unit_price=self.product.trade_price,
            created_by=self.user,
        )
        order_line = SupplierOrderLine.objects.get(procurement=procurement)

        from supplier_portal.payments import mark_supplier_order_paid

        mark_supplier_order_paid(
            order_line_id=order_line.id,
            payment_intent_id='pi_test_123',
            paid_by_email='payer@test.com',
        )
        order_line.refresh_from_db()
        self.assertEqual(order_line.payment_status, 'paid')
        mock_supplier_email.assert_called_once_with(order_line)
        mock_studio_email.assert_called_once_with(order_line, paid_by_email='payer@test.com')

    @patch('supplier_portal.payments.mark_supplier_order_paid')
    def test_checkout_completed_webhook_marks_paid_and_passes_payer_email(self, mock_mark_paid):
        procurement = Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=1,
            unit_price=self.product.trade_price,
        )
        order_line = SupplierOrderLine.objects.get(procurement=procurement)

        from supplier_portal.payments import handle_supplier_checkout_completed

        handle_supplier_checkout_completed(
            {
                'metadata': {
                    'type': 'supplier_order_payment',
                    'supplier_order_line_id': str(order_line.id),
                    'paid_by_email': 'payer@test.com',
                },
                'payment_intent': 'pi_test_456',
            }
        )

        mock_mark_paid.assert_called_once_with(
            order_line_id=order_line.id,
            payment_intent_id='pi_test_456',
            paid_by_email='payer@test.com',
        )

    @patch('supplier_portal.emails.send_studio_supplier_payment_email')
    def test_studio_payment_email_falls_back_to_support_email(self, mock_studio_send):
        self.studio.support_email = 'billing@vividstudio.com'
        self.studio.save(update_fields=['support_email'])

        order_line = SupplierOrderLine.objects.create(
            supplier=self.supplier,
            catalog_product=self.product,
            studio=self.studio,
            project=self.project,
            quantity=1,
            unit_price=self.product.trade_price,
            currency='GBP',
        )

        from supplier_portal.emails import send_studio_supplier_payment_confirmation_email

        send_studio_supplier_payment_confirmation_email(order_line)

        mock_studio_send.assert_called_once()
        self.assertEqual(mock_studio_send.call_args.args[0], 'billing@vividstudio.com')

    @patch('supplier_portal.emails.send_studio_supplier_order_status_email')
    def test_supplier_status_update_emails_studio_on_shipped(self, mock_email):
        procurement = Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=1,
            unit_price=self.product.trade_price,
            created_by=self.user,
        )
        order_line = SupplierOrderLine.objects.get(procurement=procurement)

        login = self.client.post(
            '/supplier_portal/login/',
            {'email': 'supplier@test.com', 'password': 'supplier123'},
            format='json',
        )
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        order_line.status = 'CF'
        order_line.save(update_fields=['status'])
        response = self.client.patch(
            f'/supplier_portal/orders/{order_line.id}/update_status/',
            {'status': 'SH', 'notes': 'Dispatched via DHL'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        mock_email.assert_called_once()
        procurement.refresh_from_db()
        self.assertEqual(procurement.status, 'IT')
        self.assertEqual(procurement.logistic_status, 'IT')

    @patch('supplier_portal.emails.send_supplier_quote_request_email')
    def test_studio_request_catalog_quote(self, mock_email):
        self.client.force_authenticate(user=self.user)
        procurement = Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=2,
            unit_price=self.product.trade_price,
        )

        response = self.client.post(
            '/supplier_portal/studio/quotes/request/',
            {'procurement_id': procurement.id, 'message': 'Need updated trade price'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        procurement.refresh_from_db()
        self.assertEqual(procurement.status, 'QT')
        order_line = SupplierOrderLine.objects.get(procurement=procurement)
        self.assertEqual(order_line.quote_status, 'RQ')
        mock_email.assert_called_once()

    @patch('supplier_portal.quotes.send_studio_quote_received_email')
    def test_supplier_submit_quote(self, mock_email):
        procurement = Procurement.objects.create(
            project=self.project,
            studio=self.studio,
            catalog_product=self.product,
            quantity=1,
            unit_price=self.product.trade_price,
            client_access=True,
        )
        order_line = SupplierOrderLine.objects.get(procurement=procurement)
        order_line.quote_status = 'RQ'
        order_line.save(update_fields=['quote_status'])

        login = self.client.post(
            '/supplier_portal/login/',
            {'email': 'supplier@test.com', 'password': 'supplier123'},
            format='json',
        )
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(
            f'/supplier_portal/orders/{order_line.id}/submit-quote/',
            {'unit_price': '425.00', 'lead_time_days': 14, 'notes': 'Brass finish'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        procurement.refresh_from_db()
        self.assertEqual(procurement.status, 'CR')
        self.assertEqual(str(procurement.unit_price), '425.00')
        mock_email.assert_called_once()
