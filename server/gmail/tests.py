from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from .models import GmailToken


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="user@example.com", password="pass1234!", studio=None, gmail=False):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Test User"
    user.studio = studio
    user.gmail = gmail
    user.save()
    return user


class GmailConnectTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_gmail_connect_authenticated(self):
        response = self.client.get('/gmail/connect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', response.data)
        self.assertIn('accounts.google.com', response.data['auth_url'])

    def test_gmail_connect_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/gmail/connect/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GmailCallbackTests(APITestCase):
    def test_gmail_callback_error(self):
        response = self.client.get('/gmail/callback/', {'error': 'access_denied'})
        self.assertEqual(response.status_code, 302)
        self.assertIn('/oauth/gmail/callback', response.url)
        self.assertIn('reason=access_denied', response.url)

    def test_gmail_callback_no_code(self):
        response = self.client.get('/gmail/callback/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)


class GmailDisconnectTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio, gmail=True)
        self.client.force_authenticate(user=self.user)

    def test_disconnect_gmail_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/gmail/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_disconnect_gmail_no_token(self):
        response = self.client.post('/gmail/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_disconnect_gmail_with_token(self):
        from django.utils import timezone
        from datetime import timedelta
        GmailToken.objects.create(
            user=self.user,
            access_token='access-tok',
            refresh_token='refresh-tok',
            expires_at=timezone.now() + timedelta(hours=1),
        )
        response = self.client.post('/gmail/disconnect/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(GmailToken.objects.filter(user=self.user).count(), 0)
        self.user.refresh_from_db()
        self.assertFalse(self.user.gmail)


class GmailFetchEmailsTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio, gmail=False)
        self.client.force_authenticate(user=self.user)

    def test_fetch_emails_no_gmail_connected(self):
        response = self.client.post('/gmail/fetch/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_fetch_emails_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/gmail/fetch/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('gmail.views.fetch_gmail_messages')
    def test_fetch_emails_success(self, mock_fetch):
        self.user.gmail = True
        self.user.save()
        mock_fetch.return_value = {'fetched': 5}
        response = self.client.post('/gmail/fetch/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class GmailSendEmailTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio, gmail=False)
        self.client.force_authenticate(user=self.user)

    def test_send_email_no_gmail_connected(self):
        response = self.client.post('/gmail/send/', {'to_email': 'x@y.com', 'subject': 'Hi', 'body': 'Test'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_send_email_missing_to_email(self):
        self.user.gmail = True
        self.user.save()
        response = self.client.post('/gmail/send/', {'subject': 'Hi', 'body': 'Test'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_send_email_missing_body(self):
        self.user.gmail = True
        self.user.save()
        response = self.client.post('/gmail/send/', {'to_email': 'x@y.com', 'subject': 'Hi'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_send_email_new_without_subject(self):
        self.user.gmail = True
        self.user.save()
        response = self.client.post('/gmail/send/', {'to_email': 'x@y.com', 'body': 'Hello'}, format='json')
        self.assertEqual(response.status_code, 400)

    @patch('gmail.views.send_gmail_message')
    def test_send_email_success(self, mock_send):
        self.user.gmail = True
        self.user.save()
        mock_send.return_value = {'message_id': 'msg-123'}
        response = self.client.post(
            '/gmail/send/',
            {'to_email': 'x@y.com', 'subject': 'Hello', 'body': 'Test body'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class GmailSearchTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio, gmail=True)
        self.client.force_authenticate(user=self.user)

    def test_search_emails_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/gmail/search/?q=invoice')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_emails_authenticated(self):
        response = self.client.get('/gmail/search/?q=invoice')
        self.assertIn(response.status_code, [status.HTTP_200_OK, 400])
