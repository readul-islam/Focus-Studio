from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Attachment


class AttachmentModelTests(TestCase):
    def test_create_attachment_without_file(self):
        attachment = Attachment.objects.create()
        self.assertIsNotNone(attachment.pk)
        self.assertFalse(bool(attachment.file))

    def test_create_attachment_with_file(self):
        test_file = SimpleUploadedFile("test.txt", b"Hello attachment", content_type="text/plain")
        attachment = Attachment.objects.create(file=test_file)
        self.assertIsNotNone(attachment.pk)
        self.assertTrue(bool(attachment.file))
        attachment.file.delete(save=False)

    def test_multiple_attachments(self):
        Attachment.objects.create()
        Attachment.objects.create()
        self.assertEqual(Attachment.objects.count(), 2)
