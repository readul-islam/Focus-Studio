from rest_framework import serializers

from .models import TaskAttachment


class TaskAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    mimetype = serializers.SerializerMethodField()

    class Meta:
        model = TaskAttachment
        fields = [
            'id',
            'file_name',
            'file_size',
            'content_type',
            'mimetype',
            'file_url',
            'created_at',
        ]
        read_only_fields = fields

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

    def get_mimetype(self, obj):
        return obj.content_type or ''

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['name'] = instance.file_name
        data['metadata'] = {
            'mimetype': instance.content_type or '',
            'size': instance.file_size,
        }
        return data
