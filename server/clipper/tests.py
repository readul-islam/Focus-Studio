from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from library.models import Product


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="user@example.com", password="pass1234!", studio=None):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Test User"
    user.studio = studio
    user.save()
    return user


class ProductClipperViewTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.url = '/clipper/extract_product_details/'

    def test_unauthenticated_request(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, {'content': '<html>...</html>'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_content_field(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('clipper.views.extract_product_data')
    def test_ai_returns_none(self, mock_extract):
        mock_extract.return_value = None
        response = self.client.post(self.url, {'content': '<html>some content</html>'}, format='json')
        self.assertEqual(response.status_code, 422)
        self.assertIn('error', response.data)

    @patch('clipper.views.extract_product_data')
    def test_ai_extracts_product_data(self, mock_extract):
        mock_extract.return_value = {
            'name': 'Modern Chair',
            'supplier_name': None,
            'regular_price': 299.0,
            'images': [],
        }
        response = self.client.post(self.url, {'content': '<html>chair page</html>'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Modern Chair')

    @patch('clipper.views.extract_product_data')
    def test_supplier_lookup_found(self, mock_extract):
        from crm.models import Client
        supplier = Client.objects.create(
            name='Furniture Co',
            company_name='Furniture Co Ltd',
            contact_type='SP',
            studio=self.studio,
        )
        mock_extract.return_value = {
            'name': 'Sofa',
            'supplier_name': 'Furniture Co',
            'images': [],
        }
        response = self.client.post(self.url, {'content': '<html>sofa</html>'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('supplier'))
        self.assertEqual(response.data['supplier']['id'], supplier.id)

    @patch('clipper.views.extract_product_data')
    def test_supplier_lookup_not_found(self, mock_extract):
        mock_extract.return_value = {
            'name': 'Unknown Product',
            'supplier_name': 'NonExistentSupplier',
            'images': [],
        }
        response = self.client.post(self.url, {'content': '<html>item</html>'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get('supplier'))


class ProductSaveViewTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.url = '/clipper/save_product/'
        self.valid_payload = {
            'name': 'Oak Table',
            'description': 'A solid oak dining table',
            'currency': 'GBP',
        }

    def test_unauthenticated_request(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_name_field(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_save_product_no_images(self):
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('product_id', response.data)
        self.assertEqual(Product.objects.filter(studio=self.studio).count(), 1)

    @patch('clipper.views.requests.get')
    def test_save_product_with_images(self, mock_get):
        mock_response = MagicMock(status_code=200, content=b'fake-image-bytes')
        mock_get.return_value = mock_response

        payload = {**self.valid_payload, 'image_urls': ['https://example.com/chair.jpg']}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=response.data['product_id'])
        self.assertEqual(product.images.count(), 1)
        self.assertTrue(product.images.first().is_primary)

    @patch('clipper.views.requests.get', side_effect=Exception("Network error"))
    def test_save_product_image_download_fails_gracefully(self, mock_get):
        payload = {**self.valid_payload, 'image_urls': ['https://example.com/fail.jpg']}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=response.data['product_id'])
        self.assertEqual(product.images.count(), 0)

    def test_save_product_sets_studio_and_created_by(self):
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=response.data['product_id'])
        self.assertEqual(product.studio, self.studio)
        self.assertEqual(product.created_by, self.user)
