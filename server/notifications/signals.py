from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver


@receiver(m2m_changed, sender='projects.Project_assignees')
def notify_project_assigned(sender, instance, action, pk_set, **kwargs):
    if action != 'post_add' or not pk_set:
        return
    from notifications.models import Notification
    from users.models import User
    for user_id in pk_set:
        try:
            user = User.objects.get(pk=user_id)
            Notification.objects.create(
                recipient=user,
                notification_type='project_assigned',
                message=f"You have been assigned to project '{instance.project_name}'",
                project=instance,
            )
        except User.DoesNotExist:
            pass


@receiver(m2m_changed, sender='task.Task_assignees')
def notify_task_assigned(sender, instance, action, pk_set, **kwargs):
    if action != 'post_add' or not pk_set:
        return
    from notifications.models import Notification
    from users.models import User
    project_name = instance.project.project_name if instance.project else None
    project_part = f" in project '{project_name}'" if project_name else ''
    for user_id in pk_set:
        try:
            user = User.objects.get(pk=user_id)
            Notification.objects.create(
                recipient=user,
                notification_type='task_assigned',
                message=f"You have been assigned to task '{instance.title}'{project_part}",
                project=instance.project,
                task=instance,
            )
        except User.DoesNotExist:
            pass


@receiver(m2m_changed, sender='task.SubTask_assignees')
def notify_subtask_assigned(sender, instance, action, pk_set, **kwargs):
    if action != 'post_add' or not pk_set:
        return
    from notifications.models import Notification
    from users.models import User
    from task.models import Task
    parent_task = Task.objects.filter(subtask=instance).first()
    task_title = parent_task.title if parent_task else 'Unknown Task'
    project = parent_task.project if parent_task else None
    for user_id in pk_set:
        try:
            user = User.objects.get(pk=user_id)
            Notification.objects.create(
                recipient=user,
                notification_type='subtask_assigned',
                message=f"You have been assigned to a subtask in task '{task_title}'",
                project=project,
                task=parent_task,
                subtask=instance,
            )
        except User.DoesNotExist:
            pass


@receiver(post_save, sender='notifications.Notification')
def send_push_for_notification(sender, instance, created, **kwargs):
    if not created:
        return
    from notifications.push import push_for_notification

    push_for_notification(instance)
