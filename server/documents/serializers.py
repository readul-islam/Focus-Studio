from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    def get_item_count(self, obj):
        if obj.type == 'FOLDER':
            return obj.children.count()
        return None
