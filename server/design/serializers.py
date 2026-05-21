from rest_framework import serializers
from .models import DesignSession, DesignMessage, DesignAsset


class DesignAssetSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DesignAsset
        fields = ['id', 'image_url', 'prompt', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.file:
            return None
        url = obj.file.url
        if request:
            return request.build_absolute_uri(url)
        return url


class DesignMessageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    asset_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = DesignMessage
        fields = ['id', 'role', 'content', 'image_url', 'asset_id', 'created_at']

    def get_image_url(self, obj):
        if not obj.asset or not obj.asset.file:
            return None
        request = self.context.get('request')
        url = obj.asset.file.url
        if request:
            return request.build_absolute_uri(url)
        return url


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
