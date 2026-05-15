from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from crm.models import Client
from projects.models import Project
from .models import ClientProject


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="admin@example.com", password="pass1234!", studio=None, role="admin"):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Admin User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_client(studio, email="client@example.com", name="Jane", surname="Doe", password=None):
    client = Client.objects.create(
        name=name,
        surname=surname,
        email=email,
        contact_type='CL',
        studio=studio,
        is_active=True,
    )
    if password:
        client.set_password(password)
        client.save()
    return client


def create_project(studio, name="Test Project"):
    return Project.objects.create(project_name=name, studio=studio)


class ClientLoginTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.cl = create_client(self.studio, password="secret123")
        self.url = '/client_portal/login/'

    def test_login_missing_fields(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {'email': self.cl.email, 'password': 'wrongpass'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        response = self.client.post(self.url, {'email': 'ghost@example.com', 'password': 'secret123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        project = create_project(self.studio)
        ClientProject.objects.create(client=self.cl, project=project)
        response = self.client.post(self.url, {'email': self.cl.email, 'password': 'secret123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client', response.data)
        self.assertIn('projects', response.data)


class ClientDashboardTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.project = create_project(self.studio)
        self.url = '/client_portal/dashboard/'

    def test_dashboard_missing_project_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_invalid_project_id(self):
        response = self.client.get(f'{self.url}?project_id=9999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_dashboard_valid_project(self):
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_paid_invoice', response.data)
        self.assertIn('total_due_invoice', response.data)
        self.assertIn('action_items', response.data)
        self.assertEqual(response.data['project_id'], self.project.id)

    def test_dashboard_no_auth_required(self):
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ClientDocumentViewSetTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.project = create_project(self.studio)
        self.url = '/client_portal/documents/root_documents/'

    def test_root_documents_missing_project_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_root_documents_valid_project_empty(self):
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_root_documents_with_accessible_doc(self):
        from documents.models import Document
        Document.objects.create(name="Shared Doc", type="FILE", project=self.project, client_access=True)
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_root_documents_excludes_inaccessible(self):
        from documents.models import Document
        Document.objects.create(name="Private Doc", type="FILE", project=self.project, client_access=False)
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])


class GenerateClientCredentialsTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.project = create_project(self.studio)
        self.cl = create_client(self.studio)
        self.client.force_authenticate(user=self.user)
        self.url = '/client_portal/generate-client-login/'

    def test_missing_fields(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_client_not_found(self):
        response = self.client.post(self.url, {'project_id': self.project.id, 'client_id': 9999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_project_not_found(self):
        response = self.client.post(self.url, {'project_id': 9999, 'client_id': self.cl.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('client_portal.views.send_client_portal_welcome_email')
    def test_generate_credentials_success(self, mock_email):
        response = self.client.post(
            self.url,
            {'project_id': self.project.id, 'client_id': self.cl.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('credentials', response.data)
        self.assertTrue(ClientProject.objects.filter(client=self.cl, project=self.project).exists())

    def test_generate_credentials_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {'project_id': self.project.id, 'client_id': self.cl.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoomTotalsTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.project = create_project(self.studio)
        self.url = '/client_portal/room-totals/'

    def test_missing_project_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_project_id(self):
        response = self.client.get(f'{self.url}?project_id=9999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_valid_project_no_procurements(self):
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('rooms', response.data)
        self.assertIn('grand_total', response.data)
        self.assertEqual(response.data['grand_total'], 0)
