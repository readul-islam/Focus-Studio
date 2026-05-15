from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from crm.models import Client
from projects.models import Project
from .models import PurchaseOrder, Invoice, POLineItem, InvoiceLineItem


def create_studio(name="Finance Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="finance@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Finance User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_supplier(studio, user):
    return Client.objects.create(
        studio=studio, name="Supplier Co", company_name="Supplier Ltd",
        email="supplier@co.com", contact_type="SP", created_by=user,
    )


def create_client_contact(studio, user):
    return Client.objects.create(
        studio=studio, name="Client A", company_name="Client Ltd",
        email="clienta@co.com", contact_type="CL", created_by=user,
    )


def create_project(studio, user):
    return Project.objects.create(studio=studio, project_name="Finance Project", created_by=user)


def create_po(studio, user, project=None, supplier=None):
    return PurchaseOrder.objects.create(
        studio=studio, project=project, supplier=supplier,
        status="DFT", currency="GBP", created_by=user,
    )


def create_invoice(studio, user, project=None, client=None):
    return Invoice.objects.create(
        studio=studio, project=project, client=client,
        status="DFT", currency="GBP", created_by=user,
    )


# ---------------------------------------------------------------------------
# Purchase Order CRUD
# ---------------------------------------------------------------------------

class PurchaseOrderTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.supplier = create_supplier(self.studio, self.user)
        self.project = create_project(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _po_data(self):
        return {
            "studio": self.studio.id,
            "project": self.project.id,
            "supplier": self.supplier.id,
            "status": "DFT",
            "currency": "GBP",
            "line_items": [],
        }

    def test_create_po(self):
        response = self.client.post("/finance/purchase-orders/", self._po_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PurchaseOrder.objects.count(), 1)

    def test_list_pos(self):
        create_po(self.studio, self.user, self.project, self.supplier)
        response = self.client.get("/finance/purchase-orders/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_po(self):
        po = create_po(self.studio, self.user, self.project, self.supplier)
        response = self.client.get(f"/finance/purchase-orders/{po.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "DFT")

    def test_update_po_status(self):
        po = create_po(self.studio, self.user)
        response = self.client.patch(f"/finance/purchase-orders/{po.id}/", {"status": "SNT"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        po.refresh_from_db()
        self.assertEqual(po.status, "SNT")

    def test_delete_po(self):
        po = create_po(self.studio, self.user)
        response = self.client.delete(f"/finance/purchase-orders/{po.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(PurchaseOrder.objects.count(), 0)

    def test_create_po_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/finance/purchase-orders/", self._po_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Invoice CRUD
# ---------------------------------------------------------------------------

class InvoiceTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client_contact(self.studio, self.user)
        self.project = create_project(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _invoice_data(self):
        return {
            "studio": self.studio.id,
            "project": self.project.id,
            "client": self.contact.id,
            "status": "DFT",
            "currency": "GBP",
            "line_items": [],
        }

    def test_create_invoice(self):
        response = self.client.post("/finance/invoices/", self._invoice_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invoice.objects.count(), 1)

    def test_list_invoices(self):
        create_invoice(self.studio, self.user, self.project, self.contact)
        response = self.client.get("/finance/invoices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_invoice(self):
        inv = create_invoice(self.studio, self.user, self.project, self.contact)
        response = self.client.get(f"/finance/invoices/{inv.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "DFT")

    def test_update_invoice_status(self):
        inv = create_invoice(self.studio, self.user)
        response = self.client.patch(f"/finance/invoices/{inv.id}/", {"status": "SNT"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inv.refresh_from_db()
        self.assertEqual(inv.status, "SNT")

    def test_delete_invoice(self):
        inv = create_invoice(self.studio, self.user)
        response = self.client.delete(f"/finance/invoices/{inv.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Invoice.objects.count(), 0)

    def test_create_invoice_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/finance/invoices/", self._invoice_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Finance Summary Endpoints
# ---------------------------------------------------------------------------

class FinanceSummaryTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        create_po(self.studio, self.user, self.project)
        create_invoice(self.studio, self.user, self.project)
        self.client.force_authenticate(user=self.user)

    def test_studio_finance(self):
        response = self.client.get(f"/finance/studio-finance/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_finance(self):
        response = self.client.get(f"/finance/project-finance/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_studio_finance_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(f"/finance/studio-finance/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# PO Line Item Model
# ---------------------------------------------------------------------------

class POLineItemTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.po = create_po(self.studio, self.user)

    def test_po_line_item_total_calculation(self):
        item = POLineItem(po=self.po, description="Chair", quantity=3, unit_price="100.00")
        item.save()
        self.assertEqual(item.total, 300)

    def test_invoice_line_item_total_calculation(self):
        contact = create_client_contact(self.studio, self.user)
        inv = create_invoice(self.studio, self.user)
        item = InvoiceLineItem(invoice=inv, description="Table", quantity=2, unit_price="200.00")
        item.save()
        self.assertEqual(item.total, 400)
