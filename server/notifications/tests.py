from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from projects.models import Project
from task.models import Task
from .models import Notification


def create_studio(name="Notif Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="notif@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Notif User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_project(studio, user):
    return Project.objects.create(studio=studio, project_name="Notif Project", created_by=user)


def create_notification(recipient, project=None, notif_type="project_assigned", message="You were assigned"):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notif_type,
        message=message,
        project=project,
    )


# ---------------------------------------------------------------------------
# Notification Endpoints
# ---------------------------------------------------------------------------

class NotificationListTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def test_list_notifications_empty(self):
        response = self.client.get("/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_notifications_with_data(self):
        create_notification(self.user, self.project)
        create_notification(self.user, self.project, message="Another notification")
        response = self.client.get("/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_notifications_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/notifications/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class NotificationUnreadCountTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_unread_count_zero(self):
        response = self.client.get("/notifications/unread-count/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("count", response.data.get("unread_count", 0)), 0)

    def test_unread_count_with_notifications(self):
        create_notification(self.user)
        create_notification(self.user)
        response = self.client.get("/notifications/unread-count/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unread_count_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/notifications/unread-count/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MarkNotificationReadTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.notif = create_notification(self.user)
        self.client.force_authenticate(user=self.user)

    def test_mark_single_as_read(self):
        response = self.client.patch(f"/notifications/{self.notif.id}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.is_read)

    def test_mark_all_as_read(self):
        create_notification(self.user)
        create_notification(self.user)
        response = self.client.patch("/notifications/mark-all-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unread = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(unread, 0)

    def test_mark_nonexistent_notification_as_read(self):
        response = self.client.patch("/notifications/99999/read/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_read_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.patch(f"/notifications/{self.notif.id}/read/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class NotificationIsolationTest(APITestCase):
    """Notifications from one user are not visible to another."""

    def setUp(self):
        self.studio = create_studio()
        self.user1 = create_user(self.studio, email="user1@test.com")
        self.user2 = create_user(self.studio, email="user2@test.com")
        create_notification(self.user1, message="For user 1 only")

    def test_other_user_sees_no_notifications(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get("/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
