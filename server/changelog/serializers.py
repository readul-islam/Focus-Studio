from rest_framework import serializers
from .models import ChangeLog


class ChangeLogSerializer(serializers.ModelSerializer):
    change_type_display = serializers.CharField(source='get_change_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = ChangeLog
        fields = [
            'id',
            'title',
            'description',
            'change_type',
            'change_type_display',
            'date',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
