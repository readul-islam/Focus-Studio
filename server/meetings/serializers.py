from rest_framework import serializers
from .models import Meeting, MeetingTranscript, MeetingActionItem


class MeetingActionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingActionItem
        fields = '__all__'
        read_only_fields = ['meeting', 'created_at', 'updated_at']


class MeetingTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingTranscript
        fields = '__all__'
        read_only_fields = ['meeting', 'fetched_at']


class MeetingSerializer(serializers.ModelSerializer):
    transcript = MeetingTranscriptSerializer(read_only=True)
    action_items = MeetingActionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ['bot_id', 'bot_status', 'created_by', 'created_at', 'updated_at']


class JoinMeetingSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    platform = serializers.ChoiceField(choices=['google_meet', 'teams', 'zoom'])
    native_meeting_id = serializers.CharField(max_length=255)
    meeting_url = serializers.URLField(required=False, allow_blank=True)
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)
    studio = serializers.IntegerField(required=False, allow_null=True)
