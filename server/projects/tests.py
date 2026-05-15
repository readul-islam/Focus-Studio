from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from crm.models import Client
from .models import Phase, Room, Project, Procurement


def create_studio(name="Projects Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="proj@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Proj User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_client(studio, user):
    return Client.objects.create(
        studio=studio, name="Client", company_name="Co", email="client@co.com",
        contact_type="CL", created_by=user,
    )


def create_phase(studio, user, name="Design"):
    return Phase.objects.create(studio=studio, name=name, created_by=user)


def create_room(studio, user, name="Living Room"):
    return Room.objects.create(studio=studio, name=name, created_by=user)


def create_project(studio, user, client=None, name="My Project"):
    p = Project.objects.create(studio=studio, project_name=name, created_by=user)
    if client:
        p.client = client
        p.save()
    return p


# ---------------------------------------------------------------------------
# Phase CRUD
# ---------------------------------------------------------------------------

class PhaseTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_phase(self):
        response = self.client.post("/projects/phases/", {"name": "Feasibility", "studio": self.studio.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Phase.objects.count(), 1)

    def test_list_phases(self):
        create_phase(self.studio, self.user)
        response = self.client.get("/projects/phases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_phase(self):
        phase = create_phase(self.studio, self.user, name="Procurement Phase")
        response = self.client.get(f"/projects/phases/{phase.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Procurement Phase")

    def test_update_phase(self):
        phase = create_phase(self.studio, self.user)
        response = self.client.patch(f"/projects/phases/{phase.id}/", {"name": "Updated Phase"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        phase.refresh_from_db()
        self.assertEqual(phase.name, "Updated Phase")

    def test_delete_phase(self):
        phase = create_phase(self.studio, self.user)
        response = self.client.delete(f"/projects/phases/{phase.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Phase.objects.count(), 0)


# ---------------------------------------------------------------------------
# Room CRUD
# ---------------------------------------------------------------------------

class RoomTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_room(self):
        response = self.client.post("/projects/rooms/", {"name": "Kitchen", "studio": self.studio.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_rooms(self):
        create_room(self.studio, self.user)
        response = self.client.get("/projects/rooms/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_room(self):
        room = create_room(self.studio, self.user, name="Bedroom")
        response = self.client.get(f"/projects/rooms/{room.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Bedroom")

    def test_update_room(self):
        room = create_room(self.studio, self.user)
        response = self.client.patch(f"/projects/rooms/{room.id}/", {"name": "Dining Room"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_room(self):
        room = create_room(self.studio, self.user)
        response = self.client.delete(f"/projects/rooms/{room.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Project CRUD
# ---------------------------------------------------------------------------

class ProjectTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.contact = create_client(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _project_data(self, name="New Project"):
        return {
            "project_name": name,
            "project_type": "RS",
            "project_status": "AC",
            "studio": self.studio.id,
            "client": self.contact.id,
        }

    def test_create_project(self):
        response = self.client.post("/projects/projects/", self._project_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)

    def test_list_projects(self):
        create_project(self.studio, self.user)
        response = self.client.get("/projects/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_project(self):
        project = create_project(self.studio, self.user, name="Detail Project")
        response = self.client.get(f"/projects/projects/{project.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["project_name"], "Detail Project")

    def test_update_project(self):
        project = create_project(self.studio, self.user)
        response = self.client.patch(f"/projects/projects/{project.id}/", {"project_name": "Renamed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.project_name, "Renamed")

    def test_update_project_status(self):
        project = create_project(self.studio, self.user)
        response = self.client.patch(f"/projects/projects/{project.id}/", {"project_status": "COM"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_project(self):
        project = create_project(self.studio, self.user)
        response = self.client.delete(f"/projects/projects/{project.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_project_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/projects/projects/", self._project_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Project Custom Endpoints
# ---------------------------------------------------------------------------

class ProjectCustomEndpointsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def test_get_studio_projects(self):
        response = self.client.get(f"/projects/studio-projects/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_projects(self):
        response = self.client.get("/projects/user-projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_overview(self):
        response = self.client.get(f"/projects/project-overview/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_phases(self):
        phase = create_phase(self.studio, self.user)
        self.project.phases.add(phase)
        response = self.client.get(f"/projects/project-phases/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_rooms(self):
        room = create_room(self.studio, self.user)
        self.project.rooms.add(room)
        response = self.client.get(f"/projects/project-rooms/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_default_phases(self):
        response = self.client.get("/projects/default-phases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_studio_phases(self):
        response = self.client.get(f"/projects/studio-phases/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_studio_delivery_dates(self):
        response = self.client.get(f"/projects/studio-delivery-dates/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_delivery_dates(self):
        response = self.client.get(f"/projects/project-delivery-dates/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_studio_members_phases(self):
        response = self.client.get(f"/projects/studio-members-phases/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_project_phases_tasks(self):
        response = self.client.get(f"/projects/project-phases-tasks/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Procurement CRUD
# ---------------------------------------------------------------------------

class ProcurementTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.project = create_project(self.studio, self.user)
        self.room = create_room(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _procurement_data(self):
        return {
            "project": self.project.id,
            "room": self.room.id,
            "studio": self.studio.id,
            "status": "IR",
            "quantity": 2.0,
            "unit_price": "150.00",
        }

    def test_create_procurement(self):
        response = self.client.post("/projects/procurements/", self._procurement_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_procurements(self):
        Procurement.objects.create(studio=self.studio, project=self.project, created_by=self.user)
        response = self.client.get("/projects/procurements/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_procurement(self):
        proc = Procurement.objects.create(studio=self.studio, project=self.project, created_by=self.user)
        response = self.client.get(f"/projects/procurements/{proc.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_procurement_status(self):
        proc = Procurement.objects.create(studio=self.studio, project=self.project, created_by=self.user)
        response = self.client.patch(f"/projects/procurements/{proc.id}/", {"status": "ORD"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        proc.refresh_from_db()
        self.assertEqual(proc.status, "ORD")

    def test_delete_procurement(self):
        proc = Procurement.objects.create(studio=self.studio, project=self.project, created_by=self.user)
        response = self.client.delete(f"/projects/procurements/{proc.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_project_procurements(self):
        Procurement.objects.create(studio=self.studio, project=self.project, created_by=self.user)
        response = self.client.get(f"/projects/project-procurements/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_procurement_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/projects/procurements/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
