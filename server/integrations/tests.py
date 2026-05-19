from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from crm.models import Client
from integrations.models import StudioApiKey
from integrations.utils import generate_api_key
from users.models import Studio, User


class V1ClientsApiTest(TestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='Test Studio')
        self.user = User.objects.create_user(
            email='api@test.com',
            password='testpass123',
            studio=self.studio,
        )
        raw, prefix, key_hash = generate_api_key()
        self.api_key_raw = raw
        StudioApiKey.objects.create(
            studio=self.studio,
            name='Test',
            prefix=prefix,
            key_hash=key_hash,
            created_by=self.user,
        )
        self.client = APIClient()

    def _auth(self):
        return {'HTTP_AUTHORIZATION': f'Bearer {self.api_key_raw}'}

    def test_list_clients_requires_api_key(self):
        response = self.client.get('/integrations/v1/clients/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_create_and_list_clients(self):
        create = self.client.post(
            '/integrations/v1/clients/create/',
            {
                'name': 'Jane',
                'company_name': 'Jane Design',
                'email': 'jane@example.com',
                'contact_type': 'CL',
            },
            format='json',
            **self._auth(),
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create.data['email'], 'jane@example.com')

        listing = self.client.get('/integrations/v1/clients/', **self._auth())
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listing.data), 1)
        self.assertEqual(Client.objects.filter(studio=self.studio).count(), 1)

    def test_create_client_requires_name_or_company(self):
        response = self.client.post(
            '/integrations/v1/clients/create/',
            {'email': 'orphan@example.com'},
            format='json',
            **self._auth(),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
