from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PhaseViewSet, RoomViewSet, ProjectViewSet, ProcurementViewSet, get_studio_projects, get_user_projects, get_project_procurements, get_project_rooms, get_project_phases, get_default_phases, get_studio_phases, get_project_overview, get_studio_members_phases, get_project_phases_tasks, client_access, get_studio_delivery_dates, get_project_delivery_dates, accept_project_proposal
router = DefaultRouter()
router.register(r'phases', PhaseViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'procurements', ProcurementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user-projects/', get_user_projects, name='user-projects'),
    path('studio-projects/', get_studio_projects, name='studio-projects'),
    path('project-procurements/', get_project_procurements, name='project-procurements'),
    path('project-rooms/', get_project_rooms, name='project-rooms'),
    path('project-phases/', get_project_phases, name='project-phases'),
    path('default-phases/', get_default_phases, name='default-phases'),
    path('studio-phases/', get_studio_phases, name='studio_phases'),
    path('project-overview/', get_project_overview, name='project-overview'),
    path('studio-members-phases/', get_studio_members_phases, name='studio-members-phases'),
    path('project-phases-tasks/', get_project_phases_tasks, name='project-phases-tasks'),
    path('client-access/', client_access, name='client-access'),
    path('studio-delivery-dates/', get_studio_delivery_dates, name='studio-delivery-dates'),
    path('project-delivery-dates/', get_project_delivery_dates, name='project-delivery-dates'),
    path('proposal/accept/<uuid:token>/', accept_project_proposal, name='accept-project-proposal'),
]