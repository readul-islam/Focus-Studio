from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from projects.models import Project, Phase
from .models import Task, SubTask


def create_studio(name="Task Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="task@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Task User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_project(studio, user):
    return Project.objects.create(studio=studio, project_name="Task Project", created_by=user)


def create_phase(studio, user):
    return Phase.objects.create(studio=studio, name="Phase 1", created_by=user)


def create_task(studio, user, project=None, phase=None, title="Test Task"):
    return Task.objects.create(
        studio=studio, title=title, created_by=user,
        project=project, phase=phase, status="TD", priority="M",
    )


# ---------------------------------------------------------------------------
# SubTask CRUD
# ---------------------------------------------------------------------------

class SubTaskTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_subtask(self):
        data = {"subtask": "Do something", "studio": self.studio.id, "order": 1}
        response = self.client.post("/task/subtasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SubTask.objects.count(), 1)

    def test_list_subtasks(self):
        SubTask.objects.create(subtask="Subtask A", studio=self.studio, created_by=self.user)
        response = self.client.get("/task/subtasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_subtask(self):
        st = SubTask.objects.create(subtask="Check details", studio=self.studio, created_by=self.user)
        response = self.client.get(f"/task/subtasks/{st.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["subtask"], "Check details")

    def test_update_subtask(self):
        st = SubTask.objects.create(subtask="Original", studio=self.studio, created_by=self.user)
        response = self.client.patch(f"/task/subtasks/{st.id}/", {"subtask": "Updated", "is_completed": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        st.refresh_from_db()
        self.assertTrue(st.is_completed)

    def test_delete_subtask(self):
        st = SubTask.objects.create(subtask="Delete me", studio=self.studio, created_by=self.user)
        response = self.client.delete(f"/task/subtasks/{st.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(SubTask.objects.count(), 0)


# ---------------------------------------------------------------------------
# Task CRUD
# ---------------------------------------------------------------------------

class TaskTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.phase = create_phase(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _task_data(self, title="New Task"):
        return {
            "title": title,
            "project": self.project.id,
            "phase": self.phase.id,
            "status": "TD",
            "priority": "M",
            "studio": self.studio.id,
        }

    def test_create_task(self):
        response = self.client.post("/task/tasks/", self._task_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

    def test_create_task_minimal(self):
        response = self.client.post("/task/tasks/", {"title": "Minimal Task", "studio": self.studio.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_tasks(self):
        create_task(self.studio, self.user, project=self.project)
        response = self.client.get("/task/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_task(self):
        task = create_task(self.studio, self.user, title="Detail Task")
        response = self.client.get(f"/task/tasks/{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Detail Task")

    def test_update_task_status(self):
        task = create_task(self.studio, self.user)
        response = self.client.patch(f"/task/tasks/{task.id}/", {"status": "IP"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "IP")

    def test_update_task_priority(self):
        task = create_task(self.studio, self.user)
        response = self.client.patch(f"/task/tasks/{task.id}/", {"priority": "H"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.priority, "H")

    def test_delete_task(self):
        task = create_task(self.studio, self.user)
        response = self.client.delete(f"/task/tasks/{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_create_task_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/task/tasks/", self._task_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_task_with_assignees(self):
        data = self._task_data(title="Assigned Task")
        data["assignees"] = [self.user.id]
        response = self.client.post("/task/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_archive_task(self):
        task = create_task(self.studio, self.user)
        response = self.client.patch(f"/task/tasks/{task.id}/", {"state": "ARC"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.state, "ARC")


# ---------------------------------------------------------------------------
# Task Custom Endpoints
# ---------------------------------------------------------------------------

class TaskCustomEndpointsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.task = create_task(self.studio, self.user, project=self.project)
        self.client.force_authenticate(user=self.user)

    def test_get_user_tasks_in_project(self):
        response = self.client.get(f"/task/user-tasks-project/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_tasks(self):
        response = self.client.get("/task/user-tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_task_summary(self):
        response = self.client.get("/task/user-task-summary/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_task_datacards(self):
        response = self.client.get(f"/task/task-datacards/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_tasks_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/task/user-tasks/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Task Status Transitions
# ---------------------------------------------------------------------------

class TaskStatusTransitionTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_full_status_cycle(self):
        task = create_task(self.studio, self.user)
        self.assertEqual(task.status, "TD")

        for new_status in ["IP", "IR", "D"]:
            response = self.client.patch(f"/task/tasks/{task.id}/", {"status": new_status}, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            task.refresh_from_db()
            self.assertEqual(task.status, new_status)
