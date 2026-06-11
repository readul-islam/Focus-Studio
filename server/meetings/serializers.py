from rest_framework import serializers
from .models import Meeting, MeetingTranscript, MeetingActionItem


class MeetingActionItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = MeetingActionItem
        fields = '__all__'
        read_only_fields = ['meeting', 'created_at', 'updated_at', 'converted_task_id']

    def get_assignee_name(self, obj):
        if obj.assignee_id and obj.assignee:
            return obj.assignee.name or obj.assignee.email
        return None


class MeetingTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingTranscript
        fields = '__all__'
        read_only_fields = ['meeting', 'fetched_at']


class MeetingSerializer(serializers.ModelSerializer):
    transcript = MeetingTranscriptSerializer(read_only=True)
    action_items = MeetingActionItemSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ['bot_id', 'bot_status', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by_id and obj.created_by:
            return obj.created_by.name or obj.created_by.email
        return 'Unknown'


class JoinMeetingSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    platform = serializers.ChoiceField(choices=['google_meet', 'teams', 'zoom'])
    native_meeting_id = serializers.CharField(max_length=255, required=False, allow_blank=True)
    meeting_url = serializers.URLField(required=False, allow_blank=True)
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)
    studio = serializers.IntegerField(required=False, allow_null=True)
    project = serializers.IntegerField(required=False, allow_null=True)
    capture_source = serializers.ChoiceField(
        choices=['meeting_bot', 'site_visit', 'upload'],
        required=False,
        default='meeting_bot',
    )


class ProcessTextSerializer(serializers.Serializer):
    transcript_text = serializers.CharField(allow_blank=False)
