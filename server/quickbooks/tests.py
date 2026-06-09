from datetime import timedelta

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Studio, User

from .models import QuickBooksToken


@override_settings(
    QUICKBOOKS_CLIENT_ID='qb_test_id',
    QUICKBOOKS_CLIENT_SECRET='qb_test_secret',
    QUICKBOOKS_REDIRECT_URI='http://localhost:8000/quickbooks/callback/',
)
class QuickBooksTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='QB Studio')
        self.user = User.objects.create_user(email='qb@example.com', password='pass1234!')
        self.user.studio = self.studio
        self.user.role = 'admin'
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def test_status_not_connected(self):
        response = self.client.get('/quickbooks/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['configured'])
        self.assertFalse(response.data['connected'])

    def test_disconnect(self):
        self.studio.quickbooks = True
        self.studio.save()
        QuickBooksToken.objects.create(
            studio=self.studio,
            access_token='a',
            refresh_token='r',
            expires_at=timezone.now() + timedelta(days=30),
            realm_id='123',
        )
        response = self.client.post('/quickbooks/disconnect/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.studio.refresh_from_db()
        self.assertFalse(self.studio.quickbooks)
