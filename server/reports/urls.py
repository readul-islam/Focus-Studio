from django.urls import path
from .views import get_project_total_time, get_project_phase_time, get_phase_timelogs, get_users_time_report, get_user_detailed_report, get_procurement_summary, studio_chat

urlpatterns = [
    path('total-project-time/', get_project_total_time, name='total-project-time'),
    path('project-phase-time/<int:project_id>/', get_project_phase_time, name='project-phase-time'),
    path('phase-timelogs/<int:phase_id>/', get_phase_timelogs, name='phase-timelogs'),
    path('users-time-report/', get_users_time_report, name='users-time-report'),
    path('user-detailed-report/<int:user_id>/', get_user_detailed_report, name='user-detailed-report'),
    path('procurement-summary/', get_procurement_summary, name='procurement-summary'),
    path('chat/', studio_chat, name='studio-chat'),
]
