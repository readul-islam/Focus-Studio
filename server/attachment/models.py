from django.db import models


class Attachment(models.Model):
    file = models.FileField(blank=True, null=True)