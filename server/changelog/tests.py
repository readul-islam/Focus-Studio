from datetime import date
from rest_framework import status
from rest_framework.test import APITestCase
from .models import ChangeLog


class ChangeLogListTests(APITestCase):
    def test_list_empty(self):
        response = self.client.get('/changelog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(response.data['results'], [])

    def test_list_with_entries(self):
        ChangeLog.objects.create(title='Dark mode', description='Added dark mode.', change_type='feature', date=date(2025, 1, 10))
        ChangeLog.objects.create(title='Fix crash', description='Fixed crash on login.', change_type='fix', date=date(2025, 1, 5))
        response = self.client.get('/changelog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_ordered_by_date_descending(self):
        ChangeLog.objects.create(title='Old Feature', description='Old.', change_type='feature', date=date(2024, 6, 1))
        ChangeLog.objects.create(title='New Feature', description='New.', change_type='feature', date=date(2025, 3, 15))
        response = self.client.get('/changelog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dates = [entry['date'] for entry in response.data['results']]
        self.assertGreaterEqual(dates[0], dates[-1])

    def test_filter_by_change_type_returns_200(self):
        ChangeLog.objects.create(title='Feature A', description='A.', change_type='feature', date=date(2025, 1, 1))
        ChangeLog.objects.create(title='Bug Fix B', description='B.', change_type='fix', date=date(2025, 1, 2))
        response = self.client.get('/changelog/?change_type=feature')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_date_returns_200(self):
        ChangeLog.objects.create(title='Jan Release', description='Jan.', change_type='improvement', date=date(2025, 1, 15))
        ChangeLog.objects.create(title='Feb Release', description='Feb.', change_type='feature', date=date(2025, 2, 15))
        response = self.client.get('/changelog/?date=2025-01-15')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_no_auth_required(self):
        response = self.client.get('/changelog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ChangeLogRetrieveTests(APITestCase):
    def setUp(self):
        self.entry = ChangeLog.objects.create(
            title='API Caching',
            description='Implemented response caching.',
            change_type='improvement',
            date=date(2025, 2, 20),
        )

    def test_retrieve_existing_entry(self):
        response = self.client.get(f'/changelog/{self.entry.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'API Caching')
        self.assertEqual(response.data['change_type'], 'improvement')
        self.assertEqual(response.data['date'], '2025-02-20')

    def test_retrieve_nonexistent_entry(self):
        response = self.client.get('/changelog/9999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_fields_present(self):
        response = self.client.get(f'/changelog/{self.entry.id}/')
        self.assertIn('id', response.data)
        self.assertIn('title', response.data)
        self.assertIn('description', response.data)
        self.assertIn('change_type', response.data)
        self.assertIn('date', response.data)

    def test_write_methods_not_allowed(self):
        response = self.client.post('/changelog/', {'title': 'x', 'description': 'y', 'change_type': 'other', 'date': '2025-01-01'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.delete(f'/changelog/{self.entry.id}/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ChangeLogPaginationTests(APITestCase):
    def setUp(self):
        for i in range(5):
            ChangeLog.objects.create(
                title=f'Entry {i}',
                description=f'Description {i}',
                change_type='feature',
                date=date(2025, 1, i + 1),
            )

    def test_pagination_fields_present(self):
        response = self.client.get('/changelog/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('total_pages', response.data)
        self.assertIn('current_page', response.data)
        self.assertIn('results', response.data)

    def test_pagination_page_size(self):
        response = self.client.get('/changelog/?page_size=2')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['results']), 2)
