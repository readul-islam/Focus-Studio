from rest_framework import serializers
from .models import SubTask, Task
from projects.serializers import ProjectGetSerializer
from time_tracker.models import TimeLog
from users.serializers import UserSerializer
from comment.serializers import CommentGetSerializer

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class TaskGetSerializer(serializers.ModelSerializer):
    subtask = SubTaskSerializer(many=True)
    time_tracker = serializers.SerializerMethodField()
    project = ProjectGetSerializer()
    assignees = UserSerializer(many=True)
    comments = CommentGetSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def get_time_tracker(self, obj):
        user = self.context["request"].user
        try:
            return TimeLog.objects.get(user=user, task=obj).clock_status
        except:
            return 'OFF'

class UserTaskSummarySerializer(serializers.ModelSerializer):
    project_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'start_date', 'end_date', 'status', 'project', 'project_name', 'priority']

    def get_project_name(self, obj):
        return obj.project.project_name if obj.project else None