from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import TimeLog, TimeSession
from .serializers import TimeLogSerializer, SessionSerializer, SessionGetSerializer, TimeLogGetSerializer

class TimeLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing TimeLog instances.
    Supports CRUD operations for time logs.
    """
    queryset = TimeLog.objects.all()
    serializer_class = TimeLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        if studio is None:
            return TimeLog.objects.none()
        queryset = TimeLog.objects.filter(studio=studio)

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset

    def perform_create(self, serializer):
        """Set created_by and created_at when creating a time log."""
        serializer.save(
            created_by=self.request.user,
            created_at=timezone.now()
        )

    def perform_update(self, serializer):
        """Set updated_by and updated_at when updating a time log."""
        serializer.save(
            updated_by=self.request.user,
            updated_at=timezone.now()
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get the currently active time log for the authenticated user.
        Returns the time log if one exists with clock_status='ON', else None.
        """
        active_log = TimeLog.objects.filter(user=request.user, clock_status='ON').first()
        
        if active_log:
            active_session = TimeSession.objects.filter(time_log=active_log, end_time__isnull=True).last()
            serializer = self.get_serializer(active_log)
            data = serializer.data
            if active_session:
                data['start_time'] = active_session.start_time
            return Response(data)
        
        return Response("No active time log")


class TimeSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing TimeSession instances.
    Supports CRUD operations for time sessions.
    """
    queryset = TimeSession.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        if studio is None:
            return TimeSession.objects.none()
        queryset = TimeSession.objects.filter(time_log__studio=studio)

        time_log_id = self.request.query_params.get('time_log')
        if time_log_id:
            queryset = queryset.filter(time_log_id=time_log_id)

        return queryset

    def perform_create(self, serializer):
        """Update TimeLog status to ON when a session is created."""
        instance = serializer.save()
        if instance.time_log:
            instance.time_log.clock_status = 'ON'
            instance.time_log.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    """
    Clock in - Create a new TimeLog with status 'ON' and start a TimeSession.
    
    Expected payload:
    {
        "project": <project_id> (optional),
        "task": <task_id> (optional),
        "description": "Working on feature X" (optional),
        "studio": <studio_id> (optional)
    }
    """
    user = request.user
    
    # Check if user already has an active clock (status ON)
    active_log = TimeLog.objects.filter(user=user, clock_status='ON').first()
    if active_log:
        return Response(
            {'error': 'You already have an active time log. Please clock out first.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create new TimeLog
    time_log, _ = TimeLog.objects.get_or_create(
        user=user,
        project_id=request.data.get('project'),
        task_id=request.data.get('task'),
        description=request.data.get('description'),
        studio_id=request.data.get('studio'),
        created_by=user,
        created_at=timezone.now()
    )
    
    # Create new TimeSession
    time_session = TimeSession.objects.create(
        time_log=time_log,
        start_time=timezone.now()
    )

    time_log.clock_status = 'ON'
    time_log.save()
    
    serializer = TimeLogSerializer(time_log)
    return Response({
        'time_log': serializer.data,
        'session_id': time_session.id,
        'message': 'Clocked in successfully'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    """
    Clock out - Set TimeLog status to 'OFF' and end the current TimeSession.
    
    Optional payload:
    {
        "time_log_id": <time_log_id> (if not provided, uses the active one)
    }
    """
    user = request.user
    time_log_id = request.data.get('time_log_id')
    
    if time_log_id:
        time_log = TimeLog.objects.filter(id=time_log_id, user=user).first()
    else:
        # Get the active time log
        time_log = TimeLog.objects.filter(user=user, clock_status='ON').first()
    
    if not time_log:
        return Response(
            {'error': 'No active time log found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update time log status
    time_log.clock_status = 'OFF'
    time_log.updated_by = user
    time_log.updated_at = timezone.now()
    time_log.save()
    
    # End the active session (the one without end_time)
    active_session = TimeSession.objects.filter(
        time_log=time_log,
        end_time__isnull=True
    ).first()
    
    if active_session:
        active_session.end_time = timezone.now()
        active_session.save()
    
    serializer = TimeLogSerializer(time_log)
    return Response({
        'time_log': serializer.data,
        'message': 'Clocked out successfully'
    }, status=status.HTTP_200_OK)

from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_time_logs(request):
    """
    Get all time logs for the authenticated user.
    """
    user = User.objects.get(id=request.user.id)
    time_logs = TimeLog.objects.filter(user=user)
    
    serializer = TimeLogGetSerializer(time_logs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_time_sessions(request):
    """
    Get all time sessions of a log for the authenticated user.
    Query params:
    - time_log_id: ID of the time log to get sessions for
    """
    user = request.user
    time_log_id = request.query_params.get('time_log_id')
    
    if not time_log_id:
        return Response(
            {'error': 'time_log_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        time_log = TimeLog.objects.get(user=user, id=time_log_id)
    except TimeLog.DoesNotExist:
        return Response(
            {'error': 'Time log not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    sessions = TimeSession.objects.filter(time_log=time_log)
    
    serializer = SessionGetSerializer(sessions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_time_log_summary(request):
    """
    Get summary of time logs for the authenticated user:
    - Today's total hours
    - This week's total hours
    - This month's total hours
    - Daily total hours for the current week
    
    Optional query params:
    - user_id: get summary for specific user (defaults to authenticated user)
    - studio: filter by studio_id
    - project: filter by project_id
    """
    user_id = request.query_params.get('user_id', request.user.id)
    studio_id = request.query_params.get('studio')
    project_id = request.query_params.get('project')
    
    now = timezone.now()
    today = now.date()
    
    start_of_week = today - timedelta(days=today.weekday())
    
    start_of_month = today.replace(day=1)

    all_logs = TimeLog.objects.filter(user_id=user_id)
    
    if studio_id:
        all_logs = all_logs.filter(studio_id=studio_id)
    if project_id:
        all_logs = all_logs.filter(project_id=project_id)
    
    today_sessions = TimeSession.objects.filter(
        time_log__in=all_logs,
        start_time__date=today
    )
    week_sessions = TimeSession.objects.filter(
        time_log__in=all_logs,
        start_time__date__gte=start_of_week
    )
    month_sessions = TimeSession.objects.filter(
        time_log__in=all_logs,
        start_time__date__gte=start_of_month
    )
    
    def calc_session_hours_mins(sessions):
        total_seconds = 0
        for session in sessions:
            if session.end_time and session.start_time:
                duration = session.end_time - session.start_time
                total_seconds += duration.total_seconds()
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        return {'hours': hours, 'minutes': minutes}
    
    today_hours = calc_session_hours_mins(today_sessions)
    week_hours = calc_session_hours_mins(week_sessions)
    month_hours = calc_session_hours_mins(month_sessions)
    
    daily_breakdown = []
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        day_sessions = TimeSession.objects.filter(
            time_log__in=all_logs,
            start_time__date=day_date
        )
        day_hours = calc_session_hours_mins(day_sessions)
        daily_breakdown.append({
            'date': day_date,
            'day': day_date.strftime('%A'),
            'hours': day_hours['hours'],
            'minutes': day_hours['minutes']
        })
        
    return Response({
        'today': today_hours,
        'this_week': week_hours,
        'this_month': month_hours,
        'daily_breakdown': daily_breakdown
    }, status=status.HTTP_200_OK)
