from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project
from users.models import Studio, User
from .models import Presentation, PresentationSlide


def create_studio(name='Presentation Studio'):
    return Studio.objects.create(name=name)


def create_user(studio, email='pres@example.com'):
    user = User.objects.create_user(email=email, password='pass1234!')
    user.name = 'Presentation User'
    user.studio = studio
    user.role = 'admin'
    user.save()
    return user


def create_project(studio, user, name='Riverside Penthouse'):
    project = Project.objects.create(
        project_name=name,
        studio=studio,
        created_by=user,
    )
    project.assignees.add(user)
    return project


class PresentationTemplateTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.client.force_authenticate(user=self.user)
        self.base_url = '/presentations/presentations/'

    def test_list_templates(self):
        response = self.client.get(f'{self.base_url}templates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 4)
        ids = {item['id'] for item in response.data}
        self.assertIn('client-concept', ids)
        self.assertIn('ffe-selection', ids)

    def test_create_blank_presentation(self):
        response = self.client.post(
            self.base_url,
            {'title': 'Blank deck', 'project': self.project.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        presentation = Presentation.objects.get(id=response.data['id'])
        self.assertEqual(presentation.slides.count(), 1)

    def test_create_client_concept_template(self):
        response = self.client.post(
            self.base_url,
            {
                'title': 'Concept deck',
                'project': self.project.id,
                'template_id': 'client-concept',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        slides = PresentationSlide.objects.filter(presentation_id=response.data['id']).order_by('order')
        self.assertEqual(slides.count(), 5)
        self.assertEqual(slides.first().title, 'Cover')
        self.assertTrue(slides.first().canvas_data)

    def test_create_ffe_selection_template(self):
        response = self.client.post(
            self.base_url,
            {
                'title': 'FF&E deck',
                'project': self.project.id,
                'template_id': 'ffe-selection',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            PresentationSlide.objects.filter(presentation_id=response.data['id']).count(),
            4,
        )

    def test_invalid_template_id(self):
        response = self.client.post(
            self.base_url,
            {
                'title': 'Bad template',
                'project': self.project.id,
                'template_id': 'not-real',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
