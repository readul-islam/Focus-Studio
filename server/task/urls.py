from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubTaskViewSet, TaskViewSet, get_user_tasks_in_project, get_user_tasks, get_user_task_summary, task_datacards

router = DefaultRouter()
router.register(r'subtasks', SubTaskViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user-tasks-project/', get_user_tasks_in_project, name='user-tasks-in-project'),
    path('user-tasks/', get_user_tasks, name='user-tasks'),
    path('user-task-summary/', get_user_task_summary, name='user-task-summary'),
    path('task-datacards/', task_datacards, name='task-datacards'),
]
