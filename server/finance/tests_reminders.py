from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from crm.models import Client
from finance.models import Invoice
from finance.reminders import mark_overdue_invoices, send_invoice_reminder
from users.models import Studio, User


class InvoiceReminderTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='Reminder Studio')
        self.user = User.objects.create_user(email='reminder@example.com', password='pass1234!')
        self.user.studio = self.studio
        self.user.role = 'admin'
        self.user.save()
        self.client_user = Client.objects.create(
            studio=self.studio,
            name='Pat',
            email='pat@client.com',
            contact_type='CL',
            created_by=self.user,
        )
        self.invoice = Invoice.objects.create(
            studio=self.studio,
            client=self.client_user,
            status='SNT',
            due_date=timezone.localdate() - timedelta(days=3),
            total_amount=Decimal('500.00'),
            currency='GBP',
        )
        self.client.force_authenticate(user=self.user)

    def test_mark_overdue_invoices(self):
        updated = mark_overdue_invoices(studio_id=self.studio.id)
        self.assertEqual(updated, 1)
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, 'OVD')

    @patch('finance.reminders.send_invoice_reminder_email')
    def test_send_invoice_reminder_manual(self, mock_email):
        result = send_invoice_reminder(self.invoice, manual=True)
        self.assertTrue(result.get('sent'))
        mock_email.assert_called_once()
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.reminder_count, 1)

    @patch('finance.reminders.send_invoice_reminder_email')
    def test_send_reminder_api(self, mock_email):
        response = self.client.post(f'/finance/invoices/{self.invoice.id}/send-reminder/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_email.assert_called_once()
