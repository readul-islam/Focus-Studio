from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification, PushDeviceToken
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': count})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def register_push_token(request):
    if request.method == 'DELETE':
        token = request.query_params.get('token') or request.data.get('token')
        if token:
            PushDeviceToken.objects.filter(user=request.user, token=token).update(is_active=False)
        else:
            PushDeviceToken.objects.filter(user=request.user).update(is_active=False)
        return Response(status=status.HTTP_204_NO_CONTENT)

    token = (request.data.get('token') or '').strip()
    if not token:
        return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)

    platform = (request.data.get('platform') or '').strip()
    device_name = (request.data.get('device_name') or '').strip()[:120]

    PushDeviceToken.objects.update_or_create(
        token=token,
        defaults={
            'user': request.user,
            'platform': platform,
            'device_name': device_name,
            'is_active': True,
        },
    )
    return Response({'registered': True}, status=status.HTTP_200_OK)
