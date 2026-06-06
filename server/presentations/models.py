import uuid

from django.db import models

from design.models import DesignAsset
from library.models import Product
from projects.models import Project
from users.models import User, Studio


PIN_TYPE_CHOICES = [
    ('product', 'Product'),
    ('scene', 'Scene'),
]

COMMENT_AUTHOR_TYPE = [
    ('studio', 'Studio User'),
    ('client', 'Client'),
]


class Presentation(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='presentations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='presentations')
    title = models.CharField(max_length=255, default='Untitled Presentation')
    thumbnail = models.ImageField(upload_to='presentation_thumbnails/%Y/%m/', null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='presentations_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    client_dashboard_published = models.BooleanField(default=False)
    web_published = models.BooleanField(default=False)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    show_product_pricing = models.BooleanField(default=False)
    show_supplier_info = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.title} ({self.project_id})'


class PresentationSlide(models.Model):
    presentation = models.ForeignKey(
        Presentation, on_delete=models.CASCADE, related_name='slides'
    )
    order = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=255, blank=True, default='')
    background_color = models.CharField(max_length=20, default='#FFFFFF')
    background_image = models.ImageField(
        upload_to='presentation_slides/%Y/%m/', null=True, blank=True
    )
    # External or data URL when background is not stored as an uploaded file
    background_src = models.TextField(blank=True, default='')
    canvas_data = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'Slide {self.order} — {self.presentation.title}'


class PresentationPin(models.Model):
    slide = models.ForeignKey(
        PresentationSlide, on_delete=models.CASCADE, related_name='pins'
    )
    pin_type = models.CharField(max_length=20, choices=PIN_TYPE_CHOICES)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    design_asset = models.ForeignKey(DesignAsset, on_delete=models.SET_NULL, null=True, blank=True)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    label = models.CharField(max_length=255, blank=True, default='')
    show_pricing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.pin_type} pin on slide {self.slide_id}'


class PresentationComment(models.Model):
    slide = models.ForeignKey(
        PresentationSlide, on_delete=models.CASCADE, related_name='comments'
    )
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    text = models.TextField()
    author_type = models.CharField(max_length=20, choices=COMMENT_AUTHOR_TYPE, default='studio')
    author_name = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='presentation_comments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment on slide {self.slide_id}'
