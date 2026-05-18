from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from crm.models import Client
from projects.models import Project
from documents.models import Document
from .models import ContractorProfile, ContractorProject, ContractorSharedDocument


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="admin@example.com", password="pass1234!", studio=None, role="admin"):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Admin User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_contractor(studio, email="contractor@example.com", name="John", surname="Doe", password=None):
    contractor = Client.objects.create(
        name=name,
        surname=surname,
        email=email,
        contact_type='CN',
        studio=studio,
        is_active=True,
    )
    if password:
        contractor.set_password(password)
        contractor.save()
    return contractor


def create_project(studio, name="Test Project"):
    return Project.objects.create(project_name=name, studio=studio)


class ContractorLoginTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.contractor = create_contractor(self.studio, password="secret123")
        self.url = '/contractor_portal/login/'

    def test_login_missing_fields(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {'email': self.contractor.email, 'password': 'wrongpass'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        response = self.client.post(self.url, {'email': 'ghost@example.com', 'password': 'pass123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        response = self.client.post(self.url, {'email': self.contractor.email, 'password': 'secret123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('contractor', response.data)
        self.assertIn('projects', response.data)
        self.assertEqual(response.data['contractor']['email'], self.contractor.email)


class AddContractorTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.project = create_project(self.studio)
        self.client.force_authenticate(user=self.user)
        self.url = '/contractor_portal/add/'

    def test_add_contractor_missing_fields(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_contractor_missing_email(self):
        data = {'project_id': self.project.id, 'name': 'Alice', 'surname': 'Smith'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('contractor_portal.views.send_contractor_invite_email')
    def test_add_contractor_success(self, mock_email):
        data = {
            'project_id': self.project.id,
            'name': 'Alice',
            'surname': 'Smith',
            'email': 'alice@example.com',
            'trade': 'Builder',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Client.objects.filter(email='alice@example.com', contact_type='CN').exists())
        self.assertEqual(response.data['access_code'], 'SMIT-01')
        self.assertTrue(response.data['invite_sent'])
        self.assertIn('/project/', response.data['portal_url'])
        mock_email.assert_called_once()
        plain_message = mock_email.call_args[0][4]
        self.assertIn('SMIT-01', plain_message)

    @patch('contractor_portal.views.send_contractor_invite_email')
    def test_add_contractor_duplicate_email(self, mock_email):
        create_contractor(self.studio, email='dup@example.com')
        data = {
            'project_id': self.project.id,
            'name': 'Dup',
            'surname': 'User',
            'email': 'dup@example.com',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_contractor_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudioContractorsTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.url = '/contractor_portal/studio-contractors/'

    def test_list_studio_contractors_empty(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_studio_contractors_with_data(self):
        create_contractor(self.studio)
        create_contractor(self.studio, email='second@example.com')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_studio_contractors_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProjectContractorsTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.project = create_project(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_list_project_contractors_empty(self):
        url = f'/contractor_portal/project/{self.project.id}/contractors/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_project_contractors_with_data(self):
        contractor = create_contractor(self.studio)
        ContractorProject.objects.create(contractor=contractor, project=self.project)
        url = f'/contractor_portal/project/{self.project.id}/contractors/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_project_contractors_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = f'/contractor_portal/project/{self.project.id}/contractors/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ContractorDashboardTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.contractor = create_contractor(self.studio)
        self.project = create_project(self.studio)
        ContractorProject.objects.create(contractor=self.contractor, project=self.project)
        self.url = '/contractor_portal/dashboard/'

    def test_dashboard_missing_project_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_invalid_project_id(self):
        response = self.client.get(f'{self.url}?project_id=9999')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_dashboard_valid(self):
        response = self.client.get(f'{self.url}?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_paid_invoice', response.data)
        self.assertIn('total_due_invoice', response.data)


class ShareDocumentTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.project = create_project(self.studio)
        self.contractor = create_contractor(self.studio)
        ContractorProject.objects.create(contractor=self.contractor, project=self.project)
        self.root_file = Document.objects.create(
            name='Floor Plan.pdf',
            type='FILE',
            project=self.project,
            studio=self.studio,
        )
        folder = Document.objects.create(
            name='Drawings',
            type='FOLDER',
            project=self.project,
            studio=self.studio,
        )
        self.nested_file = Document.objects.create(
            name='Elevation.pdf',
            type='FILE',
            project=self.project,
            studio=self.studio,
            parent=folder,
        )
        self.client.force_authenticate(user=self.user)

    def test_shareable_documents_lists_nested_files(self):
        url = f'/contractor_portal/project/{self.project.id}/shareable-documents/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {item['name'] for item in response.data}
        self.assertIn('Floor Plan.pdf', names)
        self.assertIn('Elevation.pdf', names)
        self.assertNotIn('Drawings', names)

    @patch('contractor_portal.views._send_document_notification_email')
    def test_bulk_share_documents(self, mock_email):
        response = self.client.post(
            '/contractor_portal/bulk-share-documents/',
            {
                'contractor_id': self.contractor.id,
                'document_ids': [self.root_file.id, self.nested_file.id],
                'project_id': self.project.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['created'], 2)
        self.assertEqual(
            ContractorSharedDocument.objects.filter(contractor=self.contractor).count(),
            2,
        )
        self.root_file.refresh_from_db()
        self.assertTrue(self.root_file.contractor_access)
        mock_email.assert_called_once()

    def test_contractor_portal_root_documents_after_share(self):
        ContractorSharedDocument.objects.create(
            contractor=self.contractor,
            document=self.nested_file,
        )
        url = (
            f'/contractor_portal/documents/root_documents/'
            f'?project_id={self.project.id}&contractor_id={self.contractor.id}'
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {item['name'] for item in response.data}
        self.assertIn('Drawings', names)

    def test_remove_shared_document_clears_access_flag(self):
        ContractorSharedDocument.objects.create(
            contractor=self.contractor,
            document=self.root_file,
        )
        self.root_file.contractor_access = True
        self.root_file.save(update_fields=['contractor_access'])
        response = self.client.post(
            '/contractor_portal/remove-shared-document/',
            {
                'contractor_id': self.contractor.id,
                'document_id': self.root_file.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.root_file.refresh_from_db()
        self.assertFalse(self.root_file.contractor_access)

    def test_bulk_share_rejects_wrong_project(self):
        other_project = create_project(self.studio, name='Other')
        other_file = Document.objects.create(
            name='Other.pdf',
            type='FILE',
            project=other_project,
            studio=self.studio,
        )
        response = self.client.post(
            '/contractor_portal/bulk-share-documents/',
            {
                'contractor_id': self.contractor.id,
                'document_ids': [other_file.id],
                'project_id': self.project.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ContractorProfileTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.contractor = create_contractor(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_get_contractor_profile(self):
        url = f'/contractor_portal/contractor/{self.contractor.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_contractor_profile(self):
        url = f'/contractor_portal/contractor/{self.contractor.id}/'
        response = self.client.patch(url, {'name': 'Updated Name'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contractor.refresh_from_db()
        self.assertEqual(self.contractor.name, 'Updated Name')

    def test_contractor_not_found(self):
        url = '/contractor_portal/contractor/9999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
