from django.contrib.auth.hashers import check_password, make_password
from django.db import models

from projects.models import Procurement, Project
from users.models import Studio, User


ORDER_LINE_STATUS = [
    ('RQ', 'Requested'),
    ('CF', 'Confirmed'),
    ('SH', 'Shipped'),
    ('DL', 'Delivered'),
    ('CN', 'Cancelled'),
]

PAYMENT_STATUS = [
    ('pending', 'Pending'),
    ('paid', 'Paid'),
    ('failed', 'Failed'),
    ('refunded', 'Refunded'),
]

QUOTE_STATUS = [
    ('NR', 'Not requested'),
    ('RQ', 'Quote requested'),
    ('QT', 'Quoted'),
    ('DC', 'Declined'),
]


class SupplierAccount(models.Model):
    """Platform-level supplier identity with portal authentication."""

    company_name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='supplier_logos/', blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    categories = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(
        default=False,
        help_text='Verified suppliers appear in the global catalog browse experience.',
    )
    stripe_connect_account_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    stripe_connect_onboarded = models.BooleanField(default=False)
    stripe_connect_charges_enabled = models.BooleanField(default=False)
    stripe_connect_payouts_enabled = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Supplier Account'
        verbose_name_plural = 'Supplier Accounts'

    def __str__(self):
        return self.company_name

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        if not self.password:
            return False
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        return True


class CatalogProduct(models.Model):
    """Global trade catalog item owned by a supplier account."""

    supplier = models.ForeignKey(
        SupplierAccount,
        on_delete=models.CASCADE,
        related_name='catalog_products',
    )
    name = models.CharField(max_length=999)
    sku = models.CharField(max_length=100, blank=True, null=True)
    url = models.URLField(max_length=999, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=200, blank=True, null=True)
    currency = models.CharField(max_length=3, default='GBP')
    trade_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    lead_time_days = models.PositiveIntegerField(blank=True, null=True)
    dimension = models.CharField(max_length=999, blank=True, null=True)
    materials = models.CharField(max_length=999, blank=True, null=True)
    weight = models.CharField(max_length=999, blank=True, null=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='catalog_products_created',
    )

    class Meta:
        verbose_name = 'Catalog Product'
        verbose_name_plural = 'Catalog Products'
        indexes = [
            models.Index(fields=['is_published', 'category']),
            models.Index(fields=['supplier', 'is_published']),
        ]

    def __str__(self):
        return self.name


class CatalogProductImage(models.Model):
    product = models.ForeignKey(
        CatalogProduct,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='catalog_product_images/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Catalog Product Image'
        verbose_name_plural = 'Catalog Product Images'

    def __str__(self):
        return f'Image for {self.product.name}'


class SupplierOrderLine(models.Model):
    """
    Supplier-facing order line created when a studio adds a catalog product
    to project procurement.
    """

    supplier = models.ForeignKey(
        SupplierAccount,
        on_delete=models.CASCADE,
        related_name='order_lines',
    )
    catalog_product = models.ForeignKey(
        CatalogProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_lines',
    )
    procurement = models.OneToOneField(
        Procurement,
        on_delete=models.CASCADE,
        related_name='supplier_order_line',
        null=True,
        blank=True,
    )
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.FloatField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=3, default='GBP')
    status = models.CharField(max_length=2, choices=ORDER_LINE_STATUS, default='RQ')
    quote_status = models.CharField(max_length=2, choices=QUOTE_STATUS, default='NR')
    quote_requested_at = models.DateTimeField(blank=True, null=True)
    quoted_at = models.DateTimeField(blank=True, null=True)
    quoted_lead_time_days = models.PositiveIntegerField(blank=True, null=True)
    quote_notes = models.TextField(blank=True, null=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_city = models.CharField(max_length=100, blank=True, null=True)
    delivery_postcode = models.CharField(max_length=20, blank=True, null=True)
    delivery_country = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    ordered_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Supplier Order Line'
        verbose_name_plural = 'Supplier Order Lines'
        indexes = [
            models.Index(fields=['supplier', 'status']),
            models.Index(fields=['supplier', 'created_at']),
        ]

    def __str__(self):
        product_name = self.catalog_product.name if self.catalog_product else 'Unknown product'
        return f'{self.supplier.company_name} — {product_name}'

    @classmethod
    def build_delivery_from_project(cls, project):
        if not project:
            return {}
        parts = [
            project.delivery_address_line_1,
            project.delivery_address_line_2,
        ]
        return {
            'delivery_address': ', '.join(p for p in parts if p),
            'delivery_city': project.delivery_city,
            'delivery_postcode': project.delivery_postcode,
            'delivery_country': project.delivery_country,
        }
