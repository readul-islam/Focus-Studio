from unittest.mock import MagicMock, patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Studio, User


def create_studio(name='Billing Studio'):
    return Studio.objects.create(name=name)


def create_admin(studio, email='billing@example.com'):
    user = User.objects.create_user(email=email, password='pass1234!')
    user.name = 'Billing Admin'
    user.studio = studio
    user.role = 'admin'
    user.save()
    return user


@override_settings(
    STRIPE_SECRET_KEY='sk_test_fake',
    STRIPE_PRICE_SOLO='price_solo_test',
    STRIPE_PRICE_PROFESSIONAL='price_pro_test',
    STRIPE_TRIAL_DAYS=14,
)
class BillingCheckoutTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_admin(self.studio)
        self.client.force_authenticate(user=self.user)

    @patch('billing.services.stripe.checkout.Session.create')
    @patch('billing.services.stripe.Customer.create')
    def test_create_checkout_session(self, mock_customer_create, mock_session_create):
        mock_customer_create.return_value = {'id': 'cus_test123'}
        mock_session_create.return_value = MagicMock(url='https://checkout.stripe.com/test')

        response = self.client.post(
            '/billing/checkout/',
            {'plan_tier': 'solo'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['checkout_url'], 'https://checkout.stripe.com/test')
        mock_session_create.assert_called_once()

    def test_activate_beta_plan_without_stripe(self):
        response = self.client.post(
            '/billing/activate/',
            {'plan_tier': 'beta'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subscription']['plan_tier'], 'beta')
