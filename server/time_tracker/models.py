from django.db import models
from users.models import User, Studio
from projects.models import Project
from task.models import Task 

CLOCK_STATUS = [
    ('ON', 'on'),
    ('OFF', 'off')
]

class TimeLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='time_logs', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True)
    clock_status = models.CharField(max_length=200, choices=CLOCK_STATUS, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='time_logs_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='time_logs_updated', null=True, blank=True)

    def __str__(self):
        return f"{self.user}-{self.project}-{self.task}"
    

class TimeSession(models.Model):
    time_log = models.ForeignKey(TimeLog, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.time_log}-{self.id}"
