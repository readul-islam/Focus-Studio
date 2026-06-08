import logging

import requests

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

NOTIFICATION_TITLES = {
    'task_assigned': 'Task assigned',
    'project_assigned': 'Project assigned',
    'subtask_assigned': 'Subtask assigned',
    'team_message': 'Team message',
    'comment_mention': 'Mention',
}


def notification_title(notification_type: str) -> str:
    return NOTIFICATION_TITLES.get(notification_type, 'Focuspilot')


def send_expo_push(tokens: list[str], title: str, body: str, data: dict | None = None) -> None:
    if not tokens:
        return

    messages = [
        {
            'to': token,
            'sound': 'default',
            'title': title,
            'body': body,
            'data': data or {},
            'priority': 'high',
        }
        for token in tokens
    ]

    try:
        response = requests.post(
            EXPO_PUSH_URL,
            json=messages,
            headers={
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            timeout=10,
        )
        response.raise_for_status()
    except Exception:
        logger.exception('Failed to send Expo push notification')


def push_for_notification(notification) -> None:
    from .models import PushDeviceToken

    tokens = list(
        PushDeviceToken.objects.filter(user=notification.recipient, is_active=True).values_list('token', flat=True)
    )
    if not tokens:
        return

    data = {
        'notification_id': notification.id,
        'notification_type': notification.notification_type,
    }
    if notification.task_id:
        data['task'] = notification.task_id
    if notification.project_id:
        data['project'] = notification.project_id

    send_expo_push(
        tokens,
        notification_title(notification.notification_type),
        notification.message,
        data,
    )
