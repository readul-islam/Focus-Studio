from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Comments
from .serializers import CommentSerializer, CommentGetSerializer
from users.models import User
from techstyles.mixins import StudioScopedMixin


class CommentViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return CommentGetSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        user = User.objects.get(id=self.request.user.id)
        serializer.save(user=user, studio=user.studio)

    def perform_update(self, serializer):
        serializer.save()
