from rest_framework import serializers
from .models import ProjectTeamMessage, ProjectPresence, TeamMessageAttachment
from users.models import User


class CollaborationUserSerializer(serializers.ModelSerializer):
    """Lightweight user payload for chat/presence (avoids heavy nested studio)."""

    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'profile_picture']

    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
        try:
            url = obj.profile_picture.url
            request = self.context.get('request')
            if request and url and url.startswith('/'):
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return None


class TeamMessageAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMessageAttachment
        fields = [
            'id',
            'file_name',
            'file_size',
            'content_type',
            'file_type',
            'file_url',
            'created_at',
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return None
        try:
            url = obj.file.url
            request = self.context.get('request')
            if request and url and url.startswith('/'):
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return None


class TeamChatAttachmentLibrarySerializer(TeamMessageAttachmentSerializer):
    """Attachment row for Files tab: includes who shared it and message context."""

    shared_by = CollaborationUserSerializer(source='message.user', read_only=True)
    message_id = serializers.IntegerField(source='message.id', read_only=True)
    message_sent_at = serializers.DateTimeField(source='message.created_at', read_only=True)

    class Meta(TeamMessageAttachmentSerializer.Meta):
        fields = [
            *TeamMessageAttachmentSerializer.Meta.fields,
            'message_id',
            'shared_by',
            'message_sent_at',
        ]


class ProjectTeamMessageSerializer(serializers.ModelSerializer):
    user = CollaborationUserSerializer(read_only=True)
    attachments = TeamMessageAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectTeamMessage
        fields = [
            'id',
            'project',
            'user',
            'content',
            'parent',
            'attachments',
            'is_pinned',
            'pinned_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class ProjectTeamMessageCreateSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=False, allow_blank=True, default='')
    parent_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProjectTeamMessage
        fields = ['content', 'parent_id']


class ProjectPresenceSerializer(serializers.ModelSerializer):
    user = CollaborationUserSerializer(read_only=True)

    class Meta:
        model = ProjectPresence
        fields = ['id', 'project', 'user', 'last_seen']
        read_only_fields = fields
