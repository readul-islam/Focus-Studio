from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import date
from projects.models import Project
from .models import SubTask, Task
from .serializers import SubTaskSerializer, TaskSerializer, TaskGetSerializer, UserTaskSummarySerializer
from users.permissions import TasksViewPermission
from techstyles.mixins import StudioScopedMixin

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
    