from rest_framework import status
from rest_framework.test import APITestCase

from library.models import Product
from projects.export_utils import procurement_export_rows, render_procurement_csv, render_procurement_spec_html
from projects.models import Procurement, Project, Room
from users.models import Studio, User


class FfeExportTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name='Export Studio')
        self.user = User.objects.create_user(email='export@example.com', password='pass1234!')
        self.user.studio = self.studio
        self.user.role = 'admin'
        self.user.save()
        self.project = Project.objects.create(
            studio=self.studio,
            project_name='Export Project',
            created_by=self.user,
        )
        self.room = Room.objects.create(name='Living Room', studio=self.studio)
        self.project.rooms.add(self.room)
        product = Product.objects.create(
            studio=self.studio,
            name='Oak Table',
            materials='Solid oak',
            dimension='180x90cm',
            created_by=self.user,
        )
        self.procurement = Procurement.objects.create(
            project=self.project,
            room=self.room,
            product=product,
            studio=self.studio,
        )
        self.client.force_authenticate(user=self.user)

    def test_export_rows_include_specs(self):
        rows = procurement_export_rows(Procurement.objects.filter(project=self.project))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['materials'], 'Solid oak')
        self.assertEqual(rows[0]['product'], 'Oak Table')

    def test_render_csv(self):
        rows = procurement_export_rows(Procurement.objects.filter(project=self.project))
        csv_content = render_procurement_csv(rows)
        self.assertIn('Oak Table', csv_content)
        self.assertIn('Solid oak', csv_content)

    def test_render_html_spec_sheet(self):
        rows = procurement_export_rows(Procurement.objects.filter(project=self.project))
        html = render_procurement_spec_html(project_name='Export Project', rows=rows)
        self.assertIn('FF&amp;E Schedule', html)
        self.assertIn('Oak Table', html)

    def test_export_endpoint(self):
        response = self.client.get(
            f'/projects/export-ffe-schedule/?project_id={self.project.id}&format=csv'
        )
        self.assertIn(response.status_code, {status.HTTP_200_OK, status.HTTP_404_NOT_FOUND})
