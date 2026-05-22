import logging

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import date
from projects.models import Project
from .models import SubTask, Task
from .serializers import SubTaskSerializer, TaskSerializer, TaskGetSerializer, UserTaskSummarySerializer
from users.permissions import TasksViewPermission
from techstyles.mixins import StudioScopedMixin

logger = logging.getLogger(__name__)

NOTION_INBOUND_PAUSE_SECONDS = 8


def _pause_notion_inbound_for_task(task_id: int) -> None:
    cache.set(f'notion_inbound_pause_{task_id}', True, timeout=NOTION_INBOUND_PAUSE_SECONDS)

class SubTaskViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = SubTask.objects.all()
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated, TasksViewPermission]


class TaskViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TasksViewPermission]

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return TaskGetSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        task = serializer.save()
        task.assignees.add(self.request.user)
        try:
            from notion.outbound import push_task_to_notion
            push_task_to_notion(task, self.request.user)
        except Exception:
            pass

    def perform_update(self, serializer):
        task = serializer.save()
        task_id = task.pk
        if 'status' in serializer.validated_data:
            _pause_notion_inbound_for_task(task_id)
            # Status changes: push Notion immediately (on_commit runs too late vs inbound sync)
            self._push_task_to_notion_after_save(task_id)
        else:
            transaction.on_commit(lambda: self._push_task_to_notion_after_save(task_id))

    @action(detail=True, methods=['patch'], url_path='move')
    def move(self, request, pk=None):
        """Kanban drag-and-drop: update status and sync to Notion immediately."""
        task = self.get_object()
        new_status = (request.data.get('status') or '').strip()
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)

        task.status = new_status
        task.updated_at = timezone.now()
        task.save(update_fields=['status', 'updated_at'])
        _pause_notion_inbound_for_task(task.pk)
        self._push_task_to_notion_after_save(task.pk)
        return Response(TaskSerializer(task).data)

    def _push_task_to_notion_after_save(self, task_id: int) -> None:
        try:
            from notion.outbound import update_task_in_notion

            task = (
                Task.objects.select_related('project', 'phase', 'studio')
                .prefetch_related('assignees')
                .get(pk=task_id)
            )
            update_task_in_notion(task)
        except Exception as exc:
            logger.warning('Notion push after task update failed (task %s): %s', task_id, exc)

    def perform_destroy(self, instance):
        try:
            from notion.outbound import archive_task_in_notion
            archive_task_in_notion(instance)
        except Exception:
            pass
        super().perform_destroy(instance)


@api_view(['GET'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def get_user_tasks_in_project(request):
    """
    Get all tasks for the authenticated user in a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Filter tasks by project and where the user is an assignee
    tasks = Task.objects.filter(
        project_id=project_id,
        assignees=request.user
    )
    
    serializer = TaskGetSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def get_user_tasks(request):
    """
    Get all tasks for the authenticated user across all projects.
    """
    # Filter tasks where the user is an assignee
    tasks = Task.objects.filter(
        assignees=request.user
    )
    
    serializer = TaskGetSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def get_user_task_summary(request):
    """
    Get a summary of all tasks for the authenticated user, including start and end dates.
    """
    tasks = Task.objects.filter(assignees=request.user)
    serializer = UserTaskSummarySerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def task_datacards(request):
    """
    Get dashboard metrics for the authenticated user.
    Returns total task count, overdue task count, task added today count, and active projects count.
    """
    user = request.user
    today = date.today()
    
    # Total Tasks
    total_tasks = Task.objects.filter(assignees=user).count()
    
    # Overdue Tasks (End date < today and not 'D'one)
    overdue_tasks = Task.objects.filter(
        assignees=user,
        end_date__lt=today
    ).exclude(status='D').count()
    
    # Tasks Added Today
    tasks_added_today = Task.objects.filter(
        assignees=user,
        created_at__date=today
    ).count()
    
    # Active Projects (Projects assigned to user with status 'AC')
    active_projects = Project.objects.filter(
        assignees=user,
        project_status='AC'
    ).distinct().count()
    
    return Response({
        'total_task_count': total_tasks,
        'overdue_task_count': overdue_tasks,
        'task_added_today_count': tasks_added_today,
        'active_projects_count': active_projects
    }, status=status.HTTP_200_OK)
    