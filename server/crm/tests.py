from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from .models import Client, ClientNote, Lead, Proposal, ProposalLineItem


def create_studio(name="CRM Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="crm@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "CRM User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_client(studio, user, contact_type="CL", name="Alice", company="ACME"):
    return Client.objects.create(
        studio=studio,
        contact_type=contact_type,
        name=name,
        company_name=company,
        email=f"{name.lower()}@client.com",
        created_by=user,
    )


# ---------------------------------------------------------------------------
# Client CRUD
# ---------------------------------------------------------------------------

class ClientListCreateTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client_api = self.client  # DRF test client
        self.client_api.force_authenticate(user=self.user)

    def test_list_clients(self):
        create_client(self.studio, self.user)
        response = self.client_api.get("/crm/clients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_client(self):
        data = {"name": "Bob", "company_name": "Bob Co", "email": "bob@co.com", "contact_type": "CL"}
        response = self.client_api.post("/crm/clients/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 1)

    def test_create_client_unauthenticated(self):
        self.client_api.force_authenticate(user=None)
        response = self.client_api.post("/crm/clients/", {"name": "X"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ClientDetailTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def test_retrieve_client(self):
        response = self.client.get(f"/crm/clients/{self.contact.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Alice")

    def test_update_client(self):
        response = self.client.patch(f"/crm/clients/{self.contact.id}/", {"name": "Alice Updated"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.name, "Alice Updated")

    def test_delete_client(self):
        response = self.client.delete(f"/crm/clients/{self.contact.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 0)

    def test_retrieve_nonexistent_client(self):
        response = self.client.get("/crm/clients/99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StudioClientsFilterTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        create_client(self.studio, self.user, name="Client A")
        create_client(self.studio, self.user, name="Client B")
        self.client.force_authenticate(user=self.user)

    def test_get_studio_clients(self):
        response = self.client.get(f"/crm/studio-clients/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_studio_suppliers(self):
        create_client(self.studio, self.user, contact_type="SP", name="Supplier")
        response = self.client.get(f"/crm/studio-suppliers/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_studio_contacts(self):
        response = self.client.get(f"/crm/studio-contacts/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_studio_contacts_search(self):
        response = self.client.get(f"/crm/studio-contacts/?studio_id={self.studio.id}&search=Client A")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Lead CRUD
# ---------------------------------------------------------------------------

class LeadTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def _lead_data(self, title="Test Lead"):
        return {
            "title": title,
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+44123456789",
            "source": "website",
            "stage": "new",
            "studio": self.studio.id,
            "owner": self.user.id,
        }

    def test_create_lead(self):
        response = self.client.post("/crm/leads/", self._lead_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)

    def test_list_leads(self):
        Lead.objects.create(title="Existing Lead", full_name="John", source="direct", owner=self.user, studio=self.studio)
        response = self.client.get("/crm/leads/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_lead(self):
        lead = Lead.objects.create(title="My Lead", full_name="John", source="referral", owner=self.user, studio=self.studio)
        response = self.client.get(f"/crm/leads/{lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "My Lead")

    def test_update_lead_stage(self):
        lead = Lead.objects.create(title="Stage Lead", full_name="X", source="y", owner=self.user, studio=self.studio)
        response = self.client.patch(
            f"/crm/leads/{lead.id}/",
            {"stage": "qualified", "budget_range": "50k-100k", "project_type": "Residential"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.stage, "qualified")

    def test_delete_lead(self):
        lead = Lead.objects.create(title="Del Lead", full_name="X", source="y", owner=self.user, studio=self.studio)
        response = self.client.delete(f"/crm/leads/{lead.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lead.objects.filter(id=lead.id).exists())


# ---------------------------------------------------------------------------
# Proposal CRUD
# ---------------------------------------------------------------------------

class ProposalTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _proposal_data(self, title="Test Proposal"):
        return {
            "title": title,
            "client": self.contact.id,
            "currency": "GBP",
            "status": "DFT",
            "studio": self.studio.id,
        }

    def test_create_proposal(self):
        response = self.client.post("/crm/proposals/", self._proposal_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Proposal.objects.count(), 1)

    def test_list_proposals(self):
        Proposal.objects.create(title="Existing Proposal", studio=self.studio, created_by=self.user)
        response = self.client.get("/crm/proposals/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_proposal(self):
        p = Proposal.objects.create(title="Detail Proposal", studio=self.studio, created_by=self.user)
        response = self.client.get(f"/crm/proposals/{p.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Detail Proposal")

    def test_update_proposal_status(self):
        p = Proposal.objects.create(title="Update Proposal", studio=self.studio, created_by=self.user)
        response = self.client.patch(f"/crm/proposals/{p.id}/", {"status": "SNT"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        p.refresh_from_db()
        self.assertEqual(p.status, "SNT")

    def test_delete_proposal(self):
        p = Proposal.objects.create(title="Delete Proposal", studio=self.studio, created_by=self.user)
        response = self.client.delete(f"/crm/proposals/{p.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Proposal.objects.filter(id=p.id).exists())

    def test_create_proposal_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/crm/proposals/", self._proposal_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('crm.views.send_proposal_email')
    def test_send_proposal(self, mock_send_email):
        proposal = Proposal.objects.create(
            title='Send Me',
            studio=self.studio,
            client=self.contact,
            created_by=self.user,
            status='DFT',
            currency='GBP',
        )
        response = self.client.post(f'/crm/proposals/{proposal.id}/send/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send_email.assert_called_once()
        proposal.refresh_from_db()
        self.assertEqual(proposal.status, 'SNT')

    def test_send_proposal_without_client_email(self):
        contact = create_client(self.studio, self.user, name='NoEmail', company='NoEmail Co')
        contact.email = ''
        contact.save(update_fields=['email'])
        proposal = Proposal.objects.create(
            title='No Email Proposal',
            studio=self.studio,
            client=contact,
            created_by=self.user,
            status='DFT',
        )
        response = self.client.post(f'/crm/proposals/{proposal.id}/send/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProposalAiDraftTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client(self.studio, self.user)
        self.client.force_authenticate(user=self.user)
        self.url = '/crm/proposals/ai-draft/'

    def test_ai_draft_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {'project_type': 'Kitchen'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ai_draft_requires_input(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('crm.views.settings.OPENAI_API_KEY', '')
    def test_ai_draft_without_openai_key(self):
        response = self.client.post(
            self.url,
            {'draft_type': 'scope', 'project_type': 'Chelsea Penthouse'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('crm.views.generate_proposal_draft')
    def test_ai_draft_scope(self, mock_generate):
        mock_generate.return_value = {'scope': '## Project Scope\n\n### Design Development'}
        response = self.client.post(
            self.url,
            {
                'draft_type': 'scope',
                'project_type': 'Chelsea Penthouse',
                'client_name': str(self.contact.id),
                'project_description': 'Full refurb',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('scope', response.data)
        mock_generate.assert_called_once()
        kwargs = mock_generate.call_args.kwargs
        self.assertEqual(kwargs['draft_type'], 'scope')
        self.assertEqual(kwargs['client_name'], 'Alice')

    @patch('crm.views.generate_proposal_draft')
    def test_ai_draft_pricing(self, mock_generate):
        mock_generate.return_value = {
            'line_items': [
                {
                    'description': 'Concept design',
                    'quantity': 1,
                    'rate': 3500,
                    'amount': 3500,
                }
            ]
        }
        response = self.client.post(
            self.url,
            {
                'draft_type': 'pricing',
                'project_type': 'Chelsea Penthouse',
                'project_description': '## Scope\nDesign and delivery',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['line_items']), 1)
        self.assertEqual(response.data['line_items'][0]['rate'], 3500)


# ---------------------------------------------------------------------------
# Client Model - Password Logic
# ---------------------------------------------------------------------------

class ClientPasswordTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client(self.studio, self.user)

    def test_set_and_check_password(self):
        self.contact.set_password("portal123")
        self.contact.save()
        self.assertTrue(self.contact.check_password("portal123"))
        self.assertFalse(self.contact.check_password("wrong"))

    def test_check_password_no_password_set(self):
        self.assertFalse(self.contact.check_password("anything"))
