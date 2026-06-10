from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from finance.models import Invoice
from .models import ContractorProject
from .tests import create_contractor, create_project, create_studio


class ContractorInvoiceTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.contractor = create_contractor(self.studio)
        self.project = create_project(self.studio)
        ContractorProject.objects.create(contractor=self.contractor, project=self.project)
        self.sent_invoice = Invoice.objects.create(
            project=self.project,
            studio=self.studio,
            status='SNT',
            total_amount=Decimal('1500.00'),
            currency='GBP',
        )
        self.draft_invoice = Invoice.objects.create(
            project=self.project,
            studio=self.studio,
            status='DFT',
            total_amount=Decimal('500.00'),
            currency='GBP',
        )
        self.list_url = '/contractor_portal/invoices/'

    def test_list_requires_project_id(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_excludes_drafts(self):
        response = self.client.get(f'{self.list_url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {item['id'] for item in response.data}
        self.assertIn(self.sent_invoice.id, ids)
        self.assertNotIn(self.draft_invoice.id, ids)

    def test_list_rejects_unlinked_contractor(self):
        other = create_contractor(self.studio, email='other@example.com')
        response = self.client.get(
            f'{self.list_url}?project_id={self.project.id}&contractor_id={other.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_allows_linked_contractor(self):
        response = self.client.get(
            f'{self.list_url}?project_id={self.project.id}&contractor_id={self.contractor.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_sent_invoice(self):
        url = f'/contractor_portal/invoices/{self.sent_invoice.id}/'
        response = self.client.get(
            f'{url}?contractor_id={self.contractor.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['invoice_number'], f'INV-{self.sent_invoice.id:03d}')
        self.assertEqual(response.data['project']['project_name'], self.project.project_name)
        self.assertEqual(response.data['amount_due'], 1500.0)

    def test_retrieve_draft_not_found(self):
        url = f'/contractor_portal/invoices/{self.draft_invoice.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
