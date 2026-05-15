from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json
import openai
from django.conf import settings
from .chatbot_tools import TOOL_SCHEMAS, TOOL_FUNCTIONS
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter
from time_tracker.models import TimeSession, TimeLog
from datetime import timedelta
from projects.models import Project, Phase

class DurationSerializer(serializers.Serializer):
    hours = serializers.IntegerField()
    minutes = serializers.IntegerField()
    seconds = serializers.IntegerField()
    formatted = serializers.CharField()

class ProjectTimeBreakdownSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()
    project_name = serializers.CharField()
    total_time = DurationSerializer()
    total_seconds = serializers.FloatField()
    cost = serializers.FloatField()
    total_budget = serializers.FloatField(allow_null=True)
    budget_hours = serializers.FloatField(allow_null=True)
    budget_hours_seconds = serializers.FloatField(allow_null=True)

class StudioProjectReportSerializer(serializers.Serializer):
    studio_name = serializers.CharField()
    projects = ProjectTimeBreakdownSerializer(many=True)
    studio_total_time = DurationSerializer()
    studio_total_seconds = serializers.FloatField()
    studio_total_cost = serializers.FloatField()
    currency = serializers.CharField()

class PhaseTimeBreakdownSerializer(serializers.Serializer):
    phase_id = serializers.IntegerField(allow_null=True)
    phase_name = serializers.CharField()
    total_time = DurationSerializer()
    total_seconds = serializers.FloatField()
    cost = serializers.FloatField()
    total_budget = serializers.FloatField(allow_null=True)
    hour_budget = serializers.FloatField(allow_null=True)
    hour_budget_seconds = serializers.FloatField(allow_null=True)

class ProjectPhaseReportSerializer(serializers.Serializer):
    project_name = serializers.CharField()
    phases = PhaseTimeBreakdownSerializer(many=True)
    project_total_time = DurationSerializer()
    project_total_seconds = serializers.FloatField()
    project_total_cost = serializers.FloatField()
    currency = serializers.CharField()

class PhaseTimelogDetailSerializer(serializers.Serializer):
    log_id = serializers.IntegerField()
    user_name = serializers.CharField()
    task_name = serializers.CharField()
    duration = DurationSerializer()
    total_seconds = serializers.FloatField()
    cost = serializers.FloatField()
    description = serializers.CharField()
    created_at = serializers.DateTimeField()

class PhaseTimelogsReportSerializer(serializers.Serializer):
    phase_name = serializers.CharField()
    timelogs = PhaseTimelogDetailSerializer(many=True)
    phase_total_cost = serializers.FloatField()
    currency = serializers.CharField()
    total_budget = serializers.FloatField(allow_null=True)
    hour_budget = serializers.FloatField(allow_null=True)
    hour_budget_seconds = serializers.FloatField(allow_null=True)

class UserTimeBreakdownSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    total_time = DurationSerializer()
    total_seconds = serializers.FloatField()
    cost = serializers.FloatField()

class StudioUserReportSerializer(serializers.Serializer):
    studio_name = serializers.CharField()
    users = UserTimeBreakdownSerializer(many=True)
    studio_total_time = DurationSerializer()
    studio_total_seconds = serializers.FloatField()
    studio_total_cost = serializers.FloatField()
    currency = serializers.CharField()
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)

class TaskTimeBreakdownSerializer(serializers.Serializer):
    task_id = serializers.IntegerField()
    task_title = serializers.CharField()
    project_name = serializers.CharField()
    total_time = DurationSerializer()
    total_seconds = serializers.FloatField()
    cost = serializers.FloatField()

class UserDetailedReportSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    tasks = TaskTimeBreakdownSerializer(many=True)
    user_total_time = DurationSerializer()
    user_total_seconds = serializers.FloatField()
    user_total_cost = serializers.FloatField()
    currency = serializers.CharField()
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)

@extend_schema(
    responses={200: StudioProjectReportSerializer},
    description="Get total time worked project by project for the authenticated user's studio."
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_total_time(request):
    """
    Get total time worked project by project for the authenticated user's studio.
    """
    studio = request.user.studio
    if not studio:
        return Response(
            {'error': 'User is not connected to any studio.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get all projects for the studio
    projects = Project.objects.filter(studio=studio)
    
    project_breakdown = []
    studio_total_seconds = 0
    studio_total_cost = 0.0

    for project in projects:
        # Get all time logs for this project
        project_logs = TimeLog.objects.filter(project=project).select_related('user')
        
        # Get all sessions for these logs
        sessions = TimeSession.objects.filter(time_log__in=project_logs).select_related('time_log__user')
        
        project_seconds = 0
        project_cost = 0.0
        for session in sessions:
            if session.start_time and session.end_time:
                duration = session.end_time - session.start_time
                session_seconds = duration.total_seconds()
                project_seconds += session_seconds
                
                # Calculate cost based on user's pay_per_hour
                if session.time_log and session.time_log.user and session.time_log.user.pay_per_hour:
                    hours_worked = session_seconds / 3600
                    project_cost += hours_worked * session.time_log.user.pay_per_hour
        
        studio_total_seconds += project_seconds
        studio_total_cost += project_cost
        
        hours = int(project_seconds // 3600)
        minutes = int((project_seconds % 3600) // 60)
        seconds = int(project_seconds % 60)
        
        # Calculate budget totals from all phases
        project_phases = project.phases.all()
        project_total_budget = sum(phase.total_budget for phase in project_phases if phase.total_budget) or None
        project_budget_hours = sum(phase.hour_budget for phase in project_phases if phase.hour_budget) or None
        
        project_breakdown.append({
            'project_id': project.id,
            'project_name': project.project_name,
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': project_seconds,
            'cost': round(project_cost, 2),
            'total_budget': project_total_budget,
            'budget_hours': project_budget_hours,
            'budget_hours_seconds': project_budget_hours * 3600 if project_budget_hours else None
        })

    # Calculate overall studio totals
    studio_hours = int(studio_total_seconds // 3600)
    studio_minutes = int((studio_total_seconds % 3600) // 60)
    studio_seconds = int(studio_total_seconds % 60)
    
    return Response({
        'studio_name': studio.name,
        'projects': project_breakdown,
        'studio_total_time': {
            'hours': studio_hours,
            'minutes': studio_minutes,
            'seconds': studio_seconds,
            'formatted': f"{studio_hours:02}:{studio_minutes:02}:{studio_seconds:02}"
        },
        'studio_total_seconds': studio_total_seconds,
        'studio_total_cost': round(studio_total_cost, 2),
        'currency': studio.default_currency if studio.default_currency else 'GBP'
    }, status=status.HTTP_200_OK)

@extend_schema(
    responses={200: ProjectPhaseReportSerializer},
    description="Get total time worked phase by phase for a specific project."
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_phase_time(request, project_id):
    """
    Get total time worked phase by phase for a specific project.
    """
    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found or you do not have access.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all phases associated with the project
    phases = project.phases.all()
    
    phase_breakdown = []
    project_total_seconds = 0
    project_total_cost = 0.0

    for phase in phases:
        # Get all tasks for this phase and project
        from task.models import Task
        phase_tasks = Task.objects.filter(project=project, phase=phase)
        
        # Get all time logs for these tasks
        phase_logs = TimeLog.objects.filter(task__in=phase_tasks).select_related('user')
        
        # Get all sessions for these logs
        sessions = TimeSession.objects.filter(time_log__in=phase_logs).select_related('time_log__user')
        
        phase_seconds = 0
        phase_cost = 0.0
        for session in sessions:
            if session.start_time and session.end_time:
                duration = session.end_time - session.start_time
                session_seconds = duration.total_seconds()
                phase_seconds += session_seconds
                
                # Calculate cost based on user's pay_per_hour
                if session.time_log and session.time_log.user and session.time_log.user.pay_per_hour:
                    hours_worked = session_seconds / 3600
                    phase_cost += hours_worked * session.time_log.user.pay_per_hour
        
        project_total_seconds += phase_seconds
        project_total_cost += phase_cost
        
        hours = int(phase_seconds // 3600)
        minutes = int((phase_seconds % 3600) // 60)
        seconds = int(phase_seconds % 60)
        
        phase_breakdown.append({
            'phase_id': phase.id,
            'phase_name': phase.name,
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': phase_seconds,
            'cost': round(phase_cost, 2),
            'total_budget': phase.total_budget,
            'hour_budget': phase.hour_budget,
            'hour_budget_seconds': phase.hour_budget * 3600 if phase.hour_budget else None
        })

    # Handle tasks with NO phase assigned
    from task.models import Task
    unphased_tasks = Task.objects.filter(project=project, phase__isnull=True)
    unphased_logs = TimeLog.objects.filter(task__in=unphased_tasks).select_related('user')
    unphased_sessions = TimeSession.objects.filter(time_log__in=unphased_logs).select_related('time_log__user')
    
    unphased_seconds = 0
    unphased_cost = 0.0
    for session in unphased_sessions:
        if session.start_time and session.end_time:
            duration = session.end_time - session.start_time
            session_seconds = duration.total_seconds()
            unphased_seconds += session_seconds
            
            # Calculate cost
            if session.time_log and session.time_log.user and session.time_log.user.pay_per_hour:
                hours_worked = session_seconds / 3600
                unphased_cost += hours_worked * session.time_log.user.pay_per_hour
            
    if unphased_seconds > 0:
        project_total_seconds += unphased_seconds
        project_total_cost += unphased_cost
        hours = int(unphased_seconds // 3600)
        minutes = int((unphased_seconds % 3600) // 60)
        seconds = int(unphased_seconds % 60)
        
        phase_breakdown.append({
            'phase_id': None,
            'phase_name': 'Unphased Tasks',
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': unphased_seconds,
            'cost': round(unphased_cost, 2)
        })

    project_hours = int(project_total_seconds // 3600)
    project_minutes = int((project_total_seconds % 3600) // 60)
    project_seconds = int(project_total_seconds % 60)
    
    return Response({
        'project_name': project.project_name,
        'phases': phase_breakdown,
        'project_total_time': {
            'hours': project_hours,
            'minutes': project_minutes,
            'seconds': project_seconds,
            'formatted': f"{project_hours:02}:{project_minutes:02}:{project_seconds:02}"
        },
        'project_total_seconds': project_total_seconds,
        'project_total_cost': round(project_total_cost, 2),
        'currency': request.user.studio.default_currency if request.user.studio.default_currency else 'GBP'
    }, status=status.HTTP_200_OK)


@extend_schema(
    responses={200: PhaseTimelogsReportSerializer},
    description="Get all timelogs for a specific phase with user, task, and total time."
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_phase_timelogs(request, phase_id):
    """
    Get all timelogs for a specific phase with user, task, and total time.
    """
    try:
        phase = Phase.objects.get(id=phase_id, studio=request.user.studio)
    except Phase.DoesNotExist:
        return Response(
            {'error': 'Phase not found or you do not have access.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all tasks for this phase
    from task.models import Task
    phase_tasks = Task.objects.filter(phase=phase)
    
    # Get all time logs for these tasks
    timelogs = TimeLog.objects.filter(task__in=phase_tasks).select_related('user', 'task')
    
    log_details = []
    phase_total_cost = 0.0
    
    for log in timelogs:
        # Calculate duration for this specific log
        sessions = TimeSession.objects.filter(time_log=log)
        log_seconds = 0
        log_cost = 0.0
        for session in sessions:
            if session.start_time and session.end_time:
                duration = session.end_time - session.start_time
                session_seconds = duration.total_seconds()
                log_seconds += session_seconds
                
                # Calculate cost
                if log.user and log.user.pay_per_hour:
                    hours_worked = session_seconds / 3600
                    log_cost += hours_worked * log.user.pay_per_hour
        
        phase_total_cost += log_cost
        
        hours = int(log_seconds // 3600)
        minutes = int((log_seconds % 3600) // 60)
        seconds = int(log_seconds % 60)
        
        log_details.append({
            'log_id': log.id,
            'user_name': log.user.name if log.user and log.user.name else log.user.email if log.user else 'Unknown',
            'task_name': log.task.title if log.task else 'Unnamed Task',
            'duration': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': log_seconds,
            'cost': round(log_cost, 2),
            'description': log.description,
            'created_at': log.created_at
        })

    return Response({
        'phase_name': phase.name,
        'timelogs': log_details,
        'phase_total_cost': round(phase_total_cost, 2),
        'currency': request.user.studio.default_currency if request.user.studio.default_currency else 'GBP',
        'total_budget': phase.total_budget,
        'hour_budget': phase.hour_budget,
        'hour_budget_seconds': phase.hour_budget * 3600 if phase.hour_budget else None
    }, status=status.HTTP_200_OK)

from users.models import User
from django.db.models import Q

@extend_schema(
    parameters=[
        OpenApiParameter(name='start_date', description='Start date (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='end_date', description='End date (YYYY-MM-DD)', required=False, type=str),
    ],
    responses={200: StudioUserReportSerializer},
    description="Get total time worked user by user for the authenticated user's studio within a date range."
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_time_report(request):
    """
    Get total time worked user by user for the authenticated user's studio with date range filtering.
    """
    studio = request.user.studio
    if not studio:
        return Response(
            {'error': 'User is not connected to any studio.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    
    # Base filter for sessions
    session_filter = Q(time_log__studio=studio)
    
    if start_date_str:
        session_filter &= Q(start_time__date__gte=start_date_str)
    if end_date_str:
        session_filter &= Q(start_time__date__lte=end_date_str)

    # Get all users in the studio
    users = User.objects.filter(studio=studio)
    
    user_breakdown = []
    studio_total_seconds = 0
    studio_total_cost = 0.0

    for user in users:
        # Filter sessions for this specific user
        user_sessions = TimeSession.objects.filter(time_log__user=user).filter(session_filter)
        
        user_seconds = 0
        user_cost = 0.0
        for session in user_sessions:
            if session.start_time and session.end_time:
                duration = session.end_time - session.start_time
                session_seconds = duration.total_seconds()
                user_seconds += session_seconds
                
                # Calculate cost
                if user.pay_per_hour:
                    hours_worked = session_seconds / 3600
                    user_cost += hours_worked * user.pay_per_hour
        
        studio_total_seconds += user_seconds
        studio_total_cost += user_cost
        
        hours = int(user_seconds // 3600)
        minutes = int((user_seconds % 3600) // 60)
        seconds = int(user_seconds % 60)
        
        user_breakdown.append({
            'user_id': user.id,
            'user_name': user.name if user.name else user.email,
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': user_seconds,
            'cost': round(user_cost, 2)
        })

    studio_hours = int(studio_total_seconds // 3600)
    studio_minutes = int((studio_total_seconds % 3600) // 60)
    studio_seconds = int(studio_total_seconds % 60)
    
    return Response({
        'studio_name': studio.name,
        'users': user_breakdown,
        'studio_total_time': {
            'hours': studio_hours,
            'minutes': studio_minutes,
            'seconds': studio_seconds,
            'formatted': f"{studio_hours:02}:{studio_minutes:02}:{studio_seconds:02}"
        },
        'studio_total_seconds': studio_total_seconds,
        'studio_total_cost': round(studio_total_cost, 2),
        'currency': studio.default_currency if studio.default_currency else 'GBP',
        'start_date': start_date_str,
        'end_date': end_date_str
    }, status=status.HTTP_200_OK)

@extend_schema(
    parameters=[
        OpenApiParameter(name='start_date', description='Start date (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='end_date', description='End date (YYYY-MM-DD)', required=False, type=str),
    ],
    responses={200: UserDetailedReportSerializer},
    description="Get detailed task breakdown and time worked for a specific user within a date range."
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_detailed_report(request, user_id):
    """
    Get detailed task-wise time breakdown for a specific user with date range filtering.
    """
    try:
        user = User.objects.get(id=user_id, studio=request.user.studio)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found or you do not have access.'},
            status=status.HTTP_404_NOT_FOUND
        )

    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    from task.models import Task

    # All time logs for this user
    all_user_logs = TimeLog.objects.filter(user=user)

    def _get_sessions(logs):
        """Return completed, date-filtered sessions for the given log queryset."""
        qs = TimeSession.objects.filter(time_log__in=logs, end_time__isnull=False)
        if start_date_str:
            qs = qs.filter(start_time__date__gte=start_date_str)
        if end_date_str:
            qs = qs.filter(start_time__date__lte=end_date_str)
        return qs

    def _calc(sessions):
        seconds = 0.0
        cost = 0.0
        for s in sessions:
            secs = (s.end_time - s.start_time).total_seconds()
            seconds += secs
            if user.pay_per_hour:
                cost += (secs / 3600) * user.pay_per_hour
        return seconds, cost

    task_breakdown = []
    user_total_seconds = 0
    user_total_cost = 0.0

    # ── Task-linked sessions ─────────────────────────────────────────────────
    task_logs = all_user_logs.filter(task__isnull=False)
    task_ids = task_logs.values_list('task_id', flat=True).distinct()
    tasks_worked_on = Task.objects.filter(id__in=task_ids).select_related('project')

    for task in tasks_worked_on:
        task_sessions = _get_sessions(task_logs.filter(task=task))
        if not task_sessions.exists():
            continue

        task_seconds, task_cost = _calc(task_sessions)
        
        user_total_seconds += task_seconds
        user_total_cost += task_cost

        hours = int(task_seconds // 3600)
        minutes = int((task_seconds % 3600) // 60)
        seconds = int(task_seconds % 60)

        task_breakdown.append({
            'task_id': task.id,
            'task_title': task.title,
            'project_name': task.project.project_name if task.project else 'No Project',
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': task_seconds,
            'cost': round(task_cost, 2)
        })

    # ── Unassigned sessions (no task) — keeps total in sync with team report ─
    unassigned_sessions = _get_sessions(all_user_logs.filter(task__isnull=True))
    unassigned_seconds, unassigned_cost = _calc(unassigned_sessions)
    if unassigned_seconds > 0:
        user_total_seconds += unassigned_seconds
        user_total_cost += unassigned_cost
        hours = int(unassigned_seconds // 3600)
        minutes = int((unassigned_seconds % 3600) // 60)
        seconds = int(unassigned_seconds % 60)
        task_breakdown.append({
            'task_id': None,
            'task_title': 'Unassigned',
            'project_name': None,
            'total_time': {
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'formatted': f"{hours:02}:{minutes:02}:{seconds:02}"
            },
            'total_seconds': unassigned_seconds,
            'cost': round(unassigned_cost, 2)
        })

    user_hours = int(user_total_seconds // 3600)
    user_minutes = int((user_total_seconds % 3600) // 60)
    user_seconds = int(user_total_seconds % 60)
    
    return Response({
        'user_id': user.id,
        'user_name': user.name if user.name else user.email,
        'tasks': task_breakdown,
        'user_total_time': {
            'hours': user_hours,
            'minutes': user_minutes,
            'seconds': user_seconds,
            'formatted': f"{user_hours:02}:{user_minutes:02}:{user_seconds:02}"
        },
        'user_total_seconds': user_total_seconds,
        'user_total_cost': round(user_total_cost, 2),
        'currency': request.user.studio.default_currency if request.user.studio.default_currency else 'GBP',
        'start_date': start_date_str,
        'end_date': end_date_str
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_procurement_summary(request):
    """
    Returns all procurement items for the studio with spend and delivery status.
    """
    from projects.models import Procurement
    
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response({'error': 'User is not associated with any studio'}, status=status.HTTP_400_BAD_REQUEST)

    procurements = Procurement.objects.filter(
        project__studio=user.studio
    ).select_related('project', 'room', 'product', 'po', 'invoice').prefetch_related('po__line_items', 'po__supplier')

    items = []
    total_spend = 0
    awaiting = 0
    received = 0

    for p in procurements:
        unit_price = 0
        total_price = 0
        supplier_name = ''

        if p.po and p.po.line_items.exists():
            line = p.po.line_items.first()
            unit_price = float(line.unit_price) if line.unit_price else 0
            total_price = float(line.total) if line.total else 0
            if hasattr(p.po, 'supplier') and p.po.supplier:
                s = p.po.supplier
                supplier_name = getattr(s, 'name', None) or getattr(s, 'company_name', '') or ''
        elif p.product:
            unit_price = float(p.product.tader_price or p.product.regular_price or 0)
            total_price = unit_price * (p.quantity or 1)

        total_spend += total_price

        logistic = getattr(p, 'logistic_status', None) or ''
        if logistic in ['IT', 'SH']:
            awaiting += 1
        elif logistic == 'DL':
            received += 1

        items.append({
            'id': p.id,
            'project_name': p.project.project_name if p.project else '',
            'project_id': p.project.id if p.project else None,
            'room_name': p.room.name if p.room else '',
            'product_name': p.product.name if p.product else '',
            'supplier_name': supplier_name,
            'quantity': p.quantity,
            'unit_price': unit_price,
            'total_price': total_price,
            'status': getattr(p, 'status', None),
            'logistic_status': logistic,
            'eta': str(p.ETA) if p.ETA else None,
            'order_date': str(p.order_date) if p.order_date else None,
            'po_number': p.po.id if p.po else None,
            'invoice_number': p.invoice.id if p.invoice else None,
            'client_approval': getattr(p, 'client_approval', None),
        })

    return Response({
        'items': items,
        'summary': {
            'total_items': len(items),
            'total_spend': round(total_spend, 2),
            'awaiting_delivery': awaiting,
            'received': received,
        },
        'currency': user.studio.default_currency if user.studio.default_currency else 'GBP'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def studio_chat(request):
    """
    Chatbot endpoint. Accepts a natural language message and returns an answer
    drawn from live studio data via OpenAI function calling.

    Body: { "message": "How many hours did each team member log in March?" }
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'User is not connected to a studio.'}, status=status.HTTP_400_BAD_REQUEST)

    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant for an interior design studio. "
                "You have access to the studio's live data via tools. "
                "Always call the relevant tool(s) before answering — never guess numbers. "
                "Respond in clear, concise plain text. Use bullet points or simple tables when listing data."
            ),
        },
        {"role": "user", "content": message},
    ]

    # First call — let the model decide which tool(s) to use
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=TOOL_SCHEMAS,
        tool_choice="auto",
        temperature=0.2,
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if not tool_calls:
        # Model answered without needing data (e.g. a general question)
        return Response({'reply': response_message.content})

    # Execute each tool call against the database
    messages.append(response_message)

    for tool_call in tool_calls:
        fn_name = tool_call.function.name
        fn_args = json.loads(tool_call.function.arguments)
        fn = TOOL_FUNCTIONS.get(fn_name)

        if fn:
            tool_result = fn(studio=studio, **fn_args)
        else:
            tool_result = {'error': f'Unknown tool: {fn_name}'}

        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(tool_result),
        })

    # Second call — model reads the data and writes the final answer
    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.2,
    )

    return Response({'reply': final_response.choices[0].message.content})
