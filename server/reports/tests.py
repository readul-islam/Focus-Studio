from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from projects.models import Project, Phase
from task.models import Task
from time_tracker.models import TimeLog, TimeSession
from projects.models import Procurement


def create_studio(name="Reports Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="reports@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Reports User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_project(studio, user):
    return Project.objects.create(studio=studio, project_name="Report Project", created_by=user)


def create_phase(studio, user):
    return Phase.objects.create(studio=studio, name="Report Phase", created_by=user)


def create_timelog_with_session(studio, user, project):
    log = TimeLog.objects.create(studio=studio, user=user, project=project, created_by=user, clock_status="ON")
    TimeSession.objects.create(time_log=log, start_time=timezone.now(), end_time=timezone.now())
    return log


# ---------------------------------------------------------------------------
# Reports Endpoints
# ---------------------------------------------------------------------------

class ReportsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.phase = create_phase(self.studio, self.user)
        self.project.phases.add(self.phase)
        create_timelog_with_session(self.studio, self.user, self.project)
        self.client.force_authenticate(user=self.user)

    def test_total_project_time(self):
        response = self.client.get(f"/reports/total-project-time/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_phase_time(self):
        response = self.client.get(f"/reports/project-phase-time/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_phase_timelogs(self):
        response = self.client.get(f"/reports/phase-timelogs/{self.phase.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_users_time_report(self):
        response = self.client.get(f"/reports/users-time-report/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_detailed_report(self):
        response = self.client.get(f"/reports/user-detailed-report/{self.user.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_procurement_summary(self):
        response = self.client.get(f"/reports/procurement-summary/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reports_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(f"/reports/total-project-time/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
