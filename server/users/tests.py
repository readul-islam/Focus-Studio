from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import (
    User, Studio, Invitation, PasswordResetToken,
    RolePermission, StudioPhaseTemplate, StudioDefaultTask,
    ProjectTemplate, UserNotificationPreferences, UserAppearancePreferences,
    PERMISSION_CHOICES,
)


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="user@example.com", password="pass1234!", studio=None, role="admin"):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Test User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def seed_role_permissions(studio):
    for role, _ in [("admin", "Admin"), ("manager", "Manager"), ("member", "Member")]:
        for perm, _ in PERMISSION_CHOICES:
            RolePermission.objects.get_or_create(
                studio=studio, role=role, permission=perm,
                defaults={"enabled": role == "admin"},
            )


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

class RegistrationTest(APITestCase):
    url = "/user/register/"

    @patch("users.views.send_registration_welcome_email")
    def test_register_success(self, mock_email):
        data = {"email": "new@example.com", "password": "pass1234!", "name": "New User", "studio_name": "My Studio"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        # Tokens are issued as httpOnly cookies, not in response body
        self.assertIn("access", response.cookies)
        self.assertIn("refresh", response.cookies)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.get()
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(user.role, "admin")

    @patch("users.views.send_registration_welcome_email")
    def test_register_without_studio(self, mock_email):
        data = {"email": "no_studio@example.com", "password": "pass1234!", "name": "Solo"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(User.objects.get().studio)

    def test_register_missing_email(self):
        data = {"password": "pass1234!", "name": "No Email"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_password(self):
        data = {"email": "nopw@example.com", "name": "No Pass"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("users.views.send_registration_welcome_email")
    def test_register_duplicate_email(self, mock_email):
        studio = create_studio()
        create_user(studio=studio)
        data = {"email": "user@example.com", "password": "pass1234!", "name": "Dup"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(APITestCase):
    url = "/user/login/"

    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)

    def test_login_success(self):
        response = self.client.post(self.url, {"email": "user@example.com", "password": "pass1234!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        # Tokens are issued as httpOnly cookies, not in response body
        self.assertIn("access", response.cookies)
        self.assertIn("refresh", response.cookies)

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {"email": "user@example.com", "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        response = self.client.post(self.url, {"email": "ghost@example.com", "password": "pass1234!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post(self.url, {"email": "user@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TokenRefreshTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        # Login sets refresh token as a cookie on the test client
        self.client.post("/user/login/", {"email": "user@example.com", "password": "pass1234!"}, format="json")

    def test_refresh_success(self):
        # Cookie is automatically sent by the test client on subsequent requests
        response = self.client.post("/user/refresh/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.cookies)

    def test_refresh_invalid_token(self):
        # Override the cookie with a bad token
        self.client.cookies["refresh"] = "bad.token.here"
        response = self.client.post("/user/refresh/", format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Current User
# ---------------------------------------------------------------------------

class CurrentUserTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_get_current_user(self):
        response = self.client.get("/user/self/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_get_current_user_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/user/self/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_current_user(self):
        response = self.client.post("/user/self/update/", {"name": "Updated Name"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Updated Name")

    def test_update_pay_per_hour(self):
        response = self.client.post("/user/update-pay-per-hour/", {"user_id": self.user.id, "pay_per_hour": 50.0}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ChangePasswordTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        response = self.client.post(
            "/user/self/change-password/",
            {"current_password": "pass1234!", "new_password": "newpass456!", "confirm_new_password": "newpass456!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_current(self):
        response = self.client.post(
            "/user/self/change-password/",
            {"current_password": "wrong", "new_password": "newpass456!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Password Reset
# ---------------------------------------------------------------------------

class ForgotPasswordTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)

    @patch("users.views.send_password_reset_email")
    def test_forgot_password_existing_user(self, mock_email):
        response = self.client.post("/user/forgot-password/", {"email": "user@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PasswordResetToken.objects.count(), 1)

    def test_forgot_password_nonexistent_user(self):
        response = self.client.post("/user/forgot-password/", {"email": "ghost@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("users.views.send_password_reset_email")
    def test_reset_password_valid_token(self, mock_email):
        self.client.post("/user/forgot-password/", {"email": "user@example.com"}, format="json")
        token = PasswordResetToken.objects.first()
        response = self.client.post(
            "/user/reset-password/", {"token": str(token.token), "new_password": "resetpass!"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_invalid_token(self):
        response = self.client.post(
            "/user/reset-password/", {"token": "00000000-0000-0000-0000-000000000000", "new_password": "x"}, format="json"
        )
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])


# ---------------------------------------------------------------------------
# Studio
# ---------------------------------------------------------------------------

class StudioTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_get_studio(self):
        response = self.client.get("/user/studios/update/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_studio(self):
        response = self.client.patch("/user/studios/update/", {"name": "Renamed Studio"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.studio.refresh_from_db()
        self.assertEqual(self.studio.name, "Renamed Studio")

    def test_create_studio(self):
        response = self.client.post("/user/studios/", {"name": "Brand New"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_studio_users(self):
        response = self.client.get(f"/user/studio-users/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Studio Members
# ---------------------------------------------------------------------------

class StudioMembersTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.admin = create_user(email="admin@example.com", studio=self.studio, role="admin")
        self.member = create_user(email="member@example.com", studio=self.studio, role="member")
        self.client.force_authenticate(user=self.admin)

    def test_get_members(self):
        response = self.client.get("/user/studio/members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_member_role(self):
        response = self.client.patch(
            "/user/studio/members/",
            {"user_id": self.member.id, "role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member.refresh_from_db()
        self.assertEqual(self.member.role, "manager")


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------

class InvitationTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        seed_role_permissions(self.studio)
        self.admin = create_user(email="admin@example.com", studio=self.studio, role="admin")
        self.client.force_authenticate(user=self.admin)

    @patch("users.views.send_team_invitation_email")
    def test_send_invitation(self, mock_email):
        response = self.client.post("/user/invite/", {"email": "invite@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invitation.objects.count(), 1)

    @patch("users.views.send_team_invitation_email")
    def test_list_pending_invitations(self, mock_email):
        Invitation.objects.create(email="pend@example.com", sender=self.admin)
        response = self.client.get("/user/pending-invites/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    @patch("users.views.send_registration_welcome_email")
    def test_accept_invitation_creates_user(self, mock_email):
        inv = Invitation.objects.create(email="accepted@example.com", sender=self.admin)
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/user/accept-invitation/",
            {"token": str(inv.token), "name": "New Member", "password": "pass1234!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="accepted@example.com").exists())


# ---------------------------------------------------------------------------
# Roles & Permissions
# ---------------------------------------------------------------------------

class StudioRolesTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        seed_role_permissions(self.studio)
        self.admin = create_user(email="admin@example.com", studio=self.studio, role="admin")
        self.client.force_authenticate(user=self.admin)

    def test_get_roles(self):
        response = self.client.get("/user/studio/roles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_roles(self):
        perm = RolePermission.objects.filter(studio=self.studio, role="manager").first()
        response = self.client.patch(
            "/user/studio/roles/",
            [{"id": perm.id, "enabled": False}],
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Preferences
# ---------------------------------------------------------------------------

class NotificationPreferencesTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        UserNotificationPreferences.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_get_notification_preferences(self):
        response = self.client.get("/user/self/notification-preferences/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_notification_preferences(self):
        response = self.client.patch(
            "/user/self/notification-preferences/", {"marketing_emails": False}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AppearancePreferencesTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        UserAppearancePreferences.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_get_appearance(self):
        response = self.client.get("/user/self/appearance/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_appearance(self):
        response = self.client.patch("/user/self/appearance/", {"theme": "dark"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.appearance_preferences.refresh_from_db()
        self.assertEqual(self.user.appearance_preferences.theme, "dark")


# ---------------------------------------------------------------------------
# Phase Templates
# ---------------------------------------------------------------------------

class PhaseTemplateTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_phase_template(self):
        response = self.client.post("/user/studio/phase-templates/", {"name": "Design Phase"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StudioPhaseTemplate.objects.count(), 1)

    def test_list_phase_templates(self):
        StudioPhaseTemplate.objects.create(studio=self.studio, name="Phase 1")
        response = self.client.get("/user/studio/phase-templates/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_phase_template(self):
        pt = StudioPhaseTemplate.objects.create(studio=self.studio, name="Old Name")
        response = self.client.patch(f"/user/studio/phase-templates/{pt.id}/", {"name": "New Name"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pt.refresh_from_db()
        self.assertEqual(pt.name, "New Name")

    def test_delete_phase_template(self):
        pt = StudioPhaseTemplate.objects.create(studio=self.studio, name="To Delete")
        response = self.client.delete(f"/user/studio/phase-templates/{pt.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(StudioPhaseTemplate.objects.count(), 0)

    def test_add_default_tasks_to_phase(self):
        pt = StudioPhaseTemplate.objects.create(studio=self.studio, name="Phase")
        data = {"tasks": ["Task A", "Task B"]}
        response = self.client.post(f"/user/studio/phase-templates/{pt.id}/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StudioDefaultTask.objects.filter(phase_template=pt).count(), 2)


# ---------------------------------------------------------------------------
# Project Templates
# ---------------------------------------------------------------------------

class ProjectTemplateTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_project_template(self):
        response = self.client.post("/user/studio/templates/", {"name": "Residential Template"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_project_templates(self):
        ProjectTemplate.objects.create(studio=self.studio, name="Temp 1")
        response = self.client.get("/user/studio/templates/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_template_detail(self):
        pt = ProjectTemplate.objects.create(studio=self.studio, name="Detail Template")
        response = self.client.get(f"/user/studio/templates/{pt.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_project_template(self):
        pt = ProjectTemplate.objects.create(studio=self.studio, name="Old")
        response = self.client.patch(f"/user/studio/templates/{pt.id}/", {"name": "Updated"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_project_template(self):
        pt = ProjectTemplate.objects.create(studio=self.studio, name="Delete Me")
        response = self.client.delete(f"/user/studio/templates/{pt.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_add_phase_to_template(self):
        pt = ProjectTemplate.objects.create(studio=self.studio, name="Template")
        response = self.client.post(f"/user/studio/templates/{pt.id}/phases/", {"name": "Phase 1"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_phases_of_template(self):
        pt = ProjectTemplate.objects.create(studio=self.studio, name="Template")
        StudioPhaseTemplate.objects.create(studio=self.studio, template=pt, name="Phase A")
        response = self.client.get(f"/user/studio/templates/{pt.id}/phases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Misc Endpoints
# ---------------------------------------------------------------------------

class MiscUserEndpointsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_get_currency_details(self):
        response = self.client.get("/user/get-currency-details/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_currency_details_with_code(self):
        response = self.client.get("/user/get-currency-details/?code=GBP")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dashboard_authenticated(self):
        response = self.client.get("/user/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_integration_status(self):
        response = self.client.get("/user/integration-status/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_default_studio_phases(self):
        response = self.client.get("/user/studio/default-phases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
