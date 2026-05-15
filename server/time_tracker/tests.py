from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from projects.models import Project
from task.models import Task
from .models import TimeLog, TimeSession


def create_studio(name="Tracker Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="tracker@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Tracker User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_project(studio, user):
    return Project.objects.create(studio=studio, project_name="Tracker Project", created_by=user)


def create_task(studio, user, project):
    return Task.objects.create(studio=studio, title="Tracker Task", created_by=user, project=project)


def create_timelog(studio, user, project=None, task=None):
    return TimeLog.objects.create(
        studio=studio, user=user, project=project, task=task,
        clock_status="ON", created_by=user,
    )


# ---------------------------------------------------------------------------
# TimeLog CRUD
# ---------------------------------------------------------------------------

class TimeLogTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.task = create_task(self.studio, self.user, self.project)
        self.client.force_authenticate(user=self.user)

    def _timelog_data(self):
        return {
            "studio": self.studio.id,
            "project": self.project.id,
            "task": self.task.id,
            "clock_status": "ON",
            "description": "Working on feature",
        }

    def test_create_timelog(self):
        response = self.client.post("/time_tracker/timelogs/", self._timelog_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_timelogs(self):
        create_timelog(self.studio, self.user, self.project)
        response = self.client.get("/time_tracker/timelogs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_timelog(self):
        log = create_timelog(self.studio, self.user, self.project)
        response = self.client.get(f"/time_tracker/timelogs/{log.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_timelog(self):
        log = create_timelog(self.studio, self.user, self.project)
        response = self.client.patch(
            f"/time_tracker/timelogs/{log.id}/",
            {"description": "Updated description"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        log.refresh_from_db()
        self.assertEqual(log.description, "Updated description")

    def test_delete_timelog(self):
        log = create_timelog(self.studio, self.user, self.project)
        response = self.client.delete(f"/time_tracker/timelogs/{log.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_timelog_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/time_tracker/timelogs/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# TimeSession CRUD
# ---------------------------------------------------------------------------

class TimeSessionTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.timelog = create_timelog(self.studio, self.user, self.project)
        self.client.force_authenticate(user=self.user)

    def test_create_session(self):
        data = {
            "time_log": self.timelog.id,
            "start_time": timezone.now().isoformat(),
        }
        response = self.client.post("/time_tracker/sessions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_sessions(self):
        TimeSession.objects.create(time_log=self.timelog, start_time=timezone.now())
        response = self.client.get("/time_tracker/sessions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_session(self):
        session = TimeSession.objects.create(time_log=self.timelog, start_time=timezone.now())
        response = self.client.get(f"/time_tracker/sessions/{session.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_session_end_time(self):
        session = TimeSession.objects.create(time_log=self.timelog, start_time=timezone.now())
        end = timezone.now().isoformat()
        response = self.client.patch(f"/time_tracker/sessions/{session.id}/", {"end_time": end}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_session(self):
        session = TimeSession.objects.create(time_log=self.timelog, start_time=timezone.now())
        response = self.client.delete(f"/time_tracker/sessions/{session.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Clock In / Out
# ---------------------------------------------------------------------------

class ClockInOutTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.task = create_task(self.studio, self.user, self.project)
        self.client.force_authenticate(user=self.user)

    def test_clock_in(self):
        data = {"project_id": self.project.id, "task_id": self.task.id}
        response = self.client.post("/time_tracker/clock-in/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_clock_out_after_clock_in(self):
        self.client.post("/time_tracker/clock-in/", {"project_id": self.project.id, "task_id": self.task.id}, format="json")
        response = self.client.post("/time_tracker/clock-out/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_clock_in_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/time_tracker/clock-in/", {"project_id": self.project.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# User Time Endpoints
# ---------------------------------------------------------------------------

class UserTimeEndpointsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.log = create_timelog(self.studio, self.user, self.project)
        TimeSession.objects.create(time_log=self.log, start_time=timezone.now())
        self.client.force_authenticate(user=self.user)

    def test_get_user_time_logs(self):
        response = self.client.get("/time_tracker/user-time-logs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_time_sessions(self):
        response = self.client.get(f"/time_tracker/user-time-sessions/?time_log_id={self.log.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_time_summary(self):
        response = self.client.get("/time_tracker/summary/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_time_logs_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/time_tracker/user-time-logs/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
