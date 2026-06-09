from rest_framework import status
from rest_framework.test import APITestCase

from crm.models import Client
from projects.models import Project
from users.models import Studio, User


class StudioAuditLogsTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='Audit Studio')
        self.user = User.objects.create_user(email='audit@example.com', password='pass1234!')
        self.user.name = 'Audit Admin'
        self.user.studio = self.studio
        self.user.role = 'admin'
        self.user.save()
        self.client.force_authenticate(user=self.user)
        self.url = '/user/studio/audit-logs/'

    def test_audit_logs_include_recent_project(self):
        Project.objects.create(studio=self.studio, project_name='Kitchen Reno', created_by=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        actions = [row['action'] for row in response.data['results']]
        self.assertIn('created project', actions)

    def test_audit_logs_include_new_contact(self):
        Client.objects.create(
            studio=self.studio,
            name='Pat',
            company_name='Pat Ltd',
            email='pat@example.com',
            contact_type='CL',
            created_by=self.user,
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(row['action'] == 'added contact' for row in response.data['results']))
