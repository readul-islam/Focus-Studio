from rest_framework import serializers
from .models import DesignSession, DesignMessage, DesignAsset


def _absolute_media_url(file_field, request):
    """Return S3/CDN URL as-is, or prefix relative paths with the API host."""
    if not file_field:
        return None
    try:
        url = file_field.url
    except Exception:
        return None
    if not url:
        return None
    if url.startswith(('http://', 'https://')):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


class DesignAssetSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DesignAsset
        fields = ['id', 'image_url', 'prompt', 'created_at']

    def get_image_url(self, obj):
        return _absolute_media_url(obj.file, self.context.get('request'))


class DesignMessageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    sketch_url = serializers.SerializerMethodField()
    asset_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = DesignMessage
        fields = [
            'id', 'role', 'content', 'sketch_url', 'image_url', 'asset_id', 'created_at',
        ]

    def get_sketch_url(self, obj):
        return _absolute_media_url(obj.sketch, self.context.get('request'))

    def get_image_url(self, obj):
        if not obj.asset:
            return None
        return _absolute_media_url(obj.asset.file, self.context.get('request'))


class DesignSessionSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = DesignSession
        fields = [
            'id', 'title', 'design_type', 'created_at', 'updated_at', 'message_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class DesignSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignSession
        fields = ['title', 'design_type']
