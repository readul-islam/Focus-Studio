from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from crm.models import Client
from projects.models import Project
from users.models import Studio, User

from .models import ClientProject, ClientProjectMessage


class ClientMessagingTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='Messaging Studio')
        self.user = User.objects.create_user(email='studio@example.com', password='pass1234!')
        self.user.studio = self.studio
        self.user.role = 'admin'
        self.user.save()
        self.project = Project.objects.create(studio=self.studio, project_name='Chat Project', created_by=self.user)
        self.cl = Client.objects.create(
            studio=self.studio,
            name='Alex',
            email='alex@client.com',
            contact_type='CL',
            created_by=self.user,
            is_active=True,
        )
        ClientProject.objects.create(client=self.cl, project=self.project)
        self.client.force_authenticate(user=self.user)

    def _client_auth(self):
        refresh = RefreshToken()
        refresh['client_id'] = self.cl.id
        refresh['email'] = self.cl.email
        refresh['type'] = 'client'
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_studio_sends_message(self):
        response = self.client.post(
            '/projects/client-messages/',
            {
                'project_id': self.project.id,
                'client_id': self.cl.id,
                'content': 'Hello from studio',
                'sender_type': 'studio',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ClientProjectMessage.objects.count(), 1)

    def test_client_sends_message(self):
        self._client_auth()
        response = self.client.post(
            '/client_portal/project-messages/',
            {'project_id': self.project.id, 'content': 'Hello from client'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(ClientProjectMessage.objects.count(), 1)
        self.client.credentials()
        self.client.force_authenticate(user=self.user)
        list_response = self.client.get(
            f'/projects/client-messages/?project_id={self.project.id}&client_id={self.cl.id}'
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
