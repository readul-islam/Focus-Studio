from django.urls import reverse
from rest_framework import serializers
from .models import DesignSession, DesignMessage, DesignAsset


def design_asset_model_proxy_url(request, asset_id: int) -> str:
    """Same-origin GLB URL so model-viewer can load without S3 CORS."""
    path = reverse('design-asset-model', kwargs={'asset_id': asset_id})
    return request.build_absolute_uri(path)


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
    model_url = serializers.SerializerMethodField()
    model_view_url = serializers.SerializerMethodField()

    class Meta:
        model = DesignAsset
        fields = ['id', 'asset_type', 'image_url', 'model_url', 'model_view_url', 'prompt', 'created_at']

    def get_image_url(self, obj):
        if obj.asset_type != 'image':
            return None
        return _absolute_media_url(obj.file, self.context.get('request'))

    def get_model_url(self, obj):
        if obj.asset_type != 'model_3d':
            return None
        return _absolute_media_url(obj.model_file, self.context.get('request'))

    def get_model_view_url(self, obj):
        if obj.asset_type != 'model_3d':
            return None
        request = self.context.get('request')
        if request:
            return design_asset_model_proxy_url(request, obj.id)
        return self.get_model_url(obj)


class DesignMessageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    model_url = serializers.SerializerMethodField()
    model_view_url = serializers.SerializerMethodField()
    sketch_url = serializers.SerializerMethodField()
    asset_id = serializers.IntegerField(read_only=True, allow_null=True)
    asset_type = serializers.SerializerMethodField()

    class Meta:
        model = DesignMessage
        fields = [
            'id',
            'role',
            'content',
            'sketch_url',
            'image_url',
            'model_url',
            'model_view_url',
            'asset_id',
            'asset_type',
            'created_at',
        ]

    def get_sketch_url(self, obj):
        return _absolute_media_url(obj.sketch, self.context.get('request'))

    def _asset_urls(self, obj):
        if not obj.asset:
            return None, None, None
        asset = obj.asset
        request = self.context.get('request')
        if asset.asset_type == 'model_3d':
            return None, _absolute_media_url(asset.model_file, request), asset.asset_type
        return _absolute_media_url(asset.file, request), None, asset.asset_type

    def get_image_url(self, obj):
        image_url, _, _ = self._asset_urls(obj)
        return image_url

    def get_model_url(self, obj):
        _, model_url, _ = self._asset_urls(obj)
        return model_url

    def get_model_view_url(self, obj):
        if not obj.asset or obj.asset.asset_type != 'model_3d':
            return None
        request = self.context.get('request')
        if request:
            return design_asset_model_proxy_url(request, obj.asset.id)
        return self.get_model_url(obj)

    def get_asset_type(self, obj):
        _, _, asset_type = self._asset_urls(obj)
        return asset_type


class DesignSessionSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = DesignSession
        fields = [
            'id', 'title', 'design_type', 'created_at', 'updated_at', 'message_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_title(self, value):
        title = (value or '').strip()
        if not title:
            raise serializers.ValidationError('Title cannot be empty.')
        if len(title) > 255:
            raise serializers.ValidationError('Title must be 255 characters or fewer.')
        return title

    def get_message_count(self, obj):
        return obj.messages.count()


class DesignSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignSession
        fields = ['title', 'design_type']
