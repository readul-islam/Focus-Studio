from django.db import models
from users.models import User, Studio
from projects.models import Project, Phase
from comment.models import Comments
from attachment.models import Attachment

TASK_STATUS = [
    ('TD', 'To-do'),
    ('IP', 'In Progress'),
    ('IR', 'In Review'),
    ('D', 'Done'),
]

TASK_STATE = [
    ('AC', 'Active'),
    ('ARC', 'Archive'),
]

TASK_PRIORITY = [
    ('L', 'Low'),
    ('M', 'Medium'),
    ('H', 'High'),
]

class SubTask(models.Model):
    subtask = models.TextField(null=True, blank=True)
    order = models.IntegerField(null=True, blank=True)
    is_completed = models.BooleanField(default=False, null=True, blank=True)
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_subtasks')
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='subtasks_created', null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='subtasks_updated', null=True, blank=True)

    def __str__(self):
        return self.subtask

class Task(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL)
    phase = models.ForeignKey(Phase, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=200, blank=True, null=True, choices=TASK_STATUS, default='TD')
    priority = models.CharField(max_length=200, blank=True, null=True, choices=TASK_PRIORITY, default='L')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_tasks')
    attachment = models.ForeignKey(Attachment, null=True, blank=True, on_delete=models.SET_NULL)
    subtask = models.ManyToManyField(SubTask, blank=True)
    comments = models.ManyToManyField(Comments, blank=True)
    state = models.CharField(max_length=200, choices=TASK_STATE, default='AC', null=True, blank=True)
    studio = models.ForeignKey(Studio, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='tasks_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='tasks_updated', null=True, blank=True)
    
    def __str__(self):
        return f"{self.title}-{self.project}"