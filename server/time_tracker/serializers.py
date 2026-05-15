from rest_framework import serializers
from .models import TimeLog, TimeSession
from datetime import timedelta
from projects.serializers import ProjectSerializer
from task.serializers import TaskSerializer

class TimeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeLog
        fields = '__all__'

class TimeLogGetSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    project = ProjectSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    last_session_start_time = serializers.SerializerMethodField()

    class Meta:
        model = TimeLog
        fields = '__all__'

    def get_duration(self, obj):
        total = timedelta()

        if obj.clock_status == 'OFF':
            for session in obj.timesession_set.all():
                start = session.start_time
                end = session.end_time

                total += (end - start)
            total_seconds = int(total.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
        
            return f"{hours:02}:{minutes:02}:{seconds:02}"
        else:
            return
    
    def get_last_session_start_time(self, obj):
        """
        Returns the start_time of the most recent TimeSession.
        """
        sessions = getattr(obj, "_prefetched_sessions", None)
        if sessions is None:
            session = (
                TimeSession.objects.filter(time_log=obj)
                .order_by('-id')
                .first()
            )
        else:
            sessions = sorted(sessions, key=lambda s: s.id, reverse=True)
            session = sessions[0] if sessions else None

        return session.start_time if session else None
class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSession
        fields = '__all__'

class SessionGetSerializer(serializers.ModelSerializer):
    time_log = TimeLogSerializer(read_only=True)
    class Meta:
        model = TimeSession
        fields = '__all__'