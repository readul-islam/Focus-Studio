from django.db import models
from crm.models import Client
from users.models import Studio, User

class Product(models.Model):
    name = models.CharField(max_length=999, null=True, blank=True)
    supplier = models.ForeignKey(Client, on_delete=models.SET_NULL, blank=True, null=True)
    url = models.URLField(max_length=999, null=True, blank=True)
    description = models.CharField(max_length=999, null=True, blank=True)
    currency = models.CharField(max_length=3, null=True, blank=True)
    tader_price = models.FloatField(null=True, blank=True)
    regular_price = models.FloatField(null=True, blank=True)
    measurement = models.CharField(max_length=999, null=True, blank=True)
    is_fav = models.BooleanField(default=False, null=True, blank=True)
    materials = models.CharField(max_length=999, null=True, blank=True)
    dimension = models.CharField(max_length=999, null=True, blank=True)
    weight = models.CharField(max_length=999, null=True, blank=True)
    box_dimension = models.CharField(max_length=999, null=True, blank=True)
    assembly_required = models.BooleanField(default=False, null=True, blank=True)
    seat_width = models.CharField(max_length=999, null=True, blank=True)
    seat_depth = models.CharField(max_length=999, null=True, blank=True)
    seat_height = models.CharField(max_length=999, null=True, blank=True)
    composition = models.CharField(max_length=999, null=True, blank=True)
    construction = models.CharField(max_length=999, null=True, blank=True)
    feet = models.FloatField(null=True, blank=True)
    filling = models.CharField(max_length=999, null=True, blank=True)
    removeable_cushion = models.BooleanField(default=True, null=True, blank=True)
    removeable_legs = models.BooleanField(default=False, null=True, blank=True)
    frame = models.CharField(max_length=999, null=True, blank=True)
    type = models.CharField(max_length=999, null=True, blank=True)
    instruction = models.TextField(null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='products_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='products_updated', null=True, blank=True)

    def __str__(self):
        return self.name if self.name else str(self.id)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, related_name='images', null=True, blank=True)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='product_images_created', null=True, blank=True)

    def __str__(self):
        return f"Image: {self.product.name if self.product else None}"