from rest_framework import serializers
from .models import Comments
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class CommentGetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comments
        fields = '__all__'
