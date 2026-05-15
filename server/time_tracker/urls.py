from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TimeLogViewSet,
    TimeSessionViewSet,
    clock_in,
    clock_out,
    get_user_time_logs,
    get_time_log_summary,
    get_user_time_sessions
)

router = DefaultRouter()
router.register(r'timelogs', TimeLogViewSet, basename='timelog')
router.register(r'sessions', TimeSessionViewSet, basename='timesession')

urlpatterns = [
    path('', include(router.urls)),
    
    # Clock in/out endpoints
    path('clock-in/', clock_in, name='clock-in'),
    path('clock-out/', clock_out, name='clock-out'),
    
    # Time log query endpoints
    path('user-time-logs/', get_user_time_logs, name='user-time-logs'),
    path('user-time-sessions/', get_user_time_sessions, name='user-time-sessions'),
    path('summary/', get_time_log_summary, name='time-log-summary'),
]
