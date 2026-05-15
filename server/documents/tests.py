from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User, Studio
from projects.models import Project
from .models import Document

class ClientAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='test@example.com', password='password')
        self.client.force_authenticate(user=self.user)
        
        # Setup basic hierarchy
        # Root (Folder)
        #   -> Parent (Folder)
        #      -> Target (Folder)
        #         -> Child 1 (File)
        #         -> Child 2 (Folder) -> Grandchild (File)
        
        self.studio = Studio.objects.create(name="Test Studio")
        self.user.studio = self.studio
        self.user.save()
        self.project = Project.objects.create(project_name="Test Project", studio=self.studio)

        self.root = Document.objects.create(name="Root", type="FOLDER", project=self.project, studio=self.studio)
        self.parent = Document.objects.create(name="Parent", type="FOLDER", parent=self.root, project=self.project, studio=self.studio)
        self.target = Document.objects.create(name="Target", type="FOLDER", parent=self.parent, project=self.project, studio=self.studio)
        self.child1 = Document.objects.create(name="Child 1", type="FILE", parent=self.target, project=self.project, studio=self.studio)
        self.child2 = Document.objects.create(name="Child 2", type="FOLDER", parent=self.target, project=self.project, studio=self.studio)
        self.grandchild = Document.objects.create(name="Grandchild", type="FILE", parent=self.child2, project=self.project, studio=self.studio)

    def test_update_client_access_propagation(self):
        url = reverse('document-update-client-access', kwargs={'pk': self.target.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refetch all objects
        self.root.refresh_from_db()
        self.parent.refresh_from_db()
        self.target.refresh_from_db()
        self.child1.refresh_from_db()
        self.child2.refresh_from_db()
        self.grandchild.refresh_from_db()
        
        # Check downward propagation (Should NOT propagate to children as per latest requirements)
        self.assertTrue(self.target.client_access, "Target should have client access")
        self.assertFalse(self.child1.client_access, "Child 1 should NOT have client access")
        self.assertFalse(self.child2.client_access, "Child 2 should NOT have client access")
        self.assertFalse(self.grandchild.client_access, "Grandchild should NOT have client access")
        
        # Check upward propagation logic (All parents)
        self.assertTrue(self.parent.client_access, "Immediate parent should have client access")
        self.assertTrue(self.root.client_access, "Root should have client access (all parents)")

class TestMoveDocuments(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='test_move@example.com', password='password')
        self.studio = Studio.objects.create(name="Test Studio")
        self.user.studio = self.studio
        self.user.save()
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(project_name="Test Project", studio=self.studio)

        self.root_folder = Document.objects.create(name="Root Folder", type="FOLDER", project=self.project, studio=self.studio)
        self.target_folder = Document.objects.create(name="Target Folder", type="FOLDER", project=self.project, studio=self.studio)

        self.file1 = Document.objects.create(name="File 1", type="FILE", parent=self.root_folder, project=self.project, studio=self.studio)
        self.file2 = Document.objects.create(name="File 2", type="FILE", parent=self.root_folder, project=self.project, studio=self.studio)

    def test_move_documents_to_folder(self):
        url = reverse('document-move-documents')
        data = {
            'document_ids': [self.file1.id, self.file2.id],
            'parent_id': self.target_folder.id
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.file1.refresh_from_db()
        self.file2.refresh_from_db()
        
        self.assertEqual(self.file1.parent, self.target_folder)
        self.assertEqual(self.file2.parent, self.target_folder)

    def test_move_documents_to_root(self):
        url = reverse('document-move-documents')
        data = {
            'document_ids': [self.file1.id],
            'parent_id': None
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.file1.refresh_from_db()
        self.assertIsNone(self.file1.parent)

    def test_move_to_non_existent_folder(self):
        url = reverse('document-move-documents')
        data = {
            'document_ids': [self.file1.id],
            'parent_id': 9999
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_move_to_file_target(self):
        url = reverse('document-move-documents')
        data = {
            'document_ids': [self.file1.id],
            'parent_id': self.file2.id  # file2 is a FILE, not a FOLDER
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Target is not a folder')

