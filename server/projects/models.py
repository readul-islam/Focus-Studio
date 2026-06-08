import uuid
from django.db import models
from django.utils import timezone
from users.models import User, Studio
from crm.models import Client
from finance.models import PurchaseOrder, Invoice
from library.models import Product
from comment.models import Comments

PROJECT_TYPE = [
    ('RS', 'Residential'),
    ('CM', 'Commercial'),
    ('HS', 'Hospitaliy'),
]

PROJECT_STATUS = [
    ('AC', 'Active'),
    ('ARC', 'Archive'),
    ('COM', 'Complete'),
    ('WON', 'Won'),
]

PAYMENT_SCHEDULE = [
    ('FF', '50/50 Split'),
    ('TP', 'Three Payments'),
    ('PF', 'Per Phase'),
    ('M', 'Monthly'),
]

SAMPLE_CHOICE = [
    ('REQ', 'Requested'),
    ('REC', 'Received'),
    ('SUB', 'Submitted'),
]

PROCUREMENT_STATUS = [
    ('QT', 'Quoting'),
    ('IR', 'Internal Review'),
    ('IA', 'Internally Approved'),
    ('OS', 'Out of Stock'),
    ('CR', 'Client Review'),
    ('ORD', 'Ordered'),
    ('PD', 'Payment Due'),
    ('IT', 'In Transit'),
    ('INS', 'Installed'),
    ('DEL', 'Delivered'),
]

CLIENT_APPROVAL_STATUS = [
    ('APR', 'Approved'),
    ('REJ', 'Rejected'),
    ('RVW', 'Review')
]

PROCUREMENT_UNIT_TYPE = [
    ('EA', 'ea'),
    ('M', 'm'),
    ('M^^2', 'm^^2'),
    ('ST', 'set')
]

LOGISTIC_STATUS_TYPE = [
    ('NO', 'Not Ordered'),
    ('IT', 'In Transit'),
    ('DD', 'Delivered'),
]

class Phase(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    progress = models.IntegerField(null=True, blank=True)
    pre_loaded_tasks = models.JSONField(default=dict, blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_budget = models.FloatField(null=True, blank=True, default=0.0)
    hour_budget = models.FloatField(null=True, blank=True, default=0.0)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='phases_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='phases_updated', null=True, blank=True)

    def __str__(self):
        project = self.project_set.first()
        if project:
            return f"{self.name} - {project.project_name}"
        return self.name

class Room(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='rooms_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='rooms_updated', null=True, blank=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    project_name = models.CharField(max_length=200, null=True, blank=True)
    project_type = models.CharField(max_length=200, choices=PROJECT_TYPE, default='RS', null=True, blank=True)
    client = models.ForeignKey(Client, null=True, blank=True, on_delete=models.SET_NULL, related_name='client_projects')
    project_status = models.CharField(max_length=200, choices=PROJECT_STATUS, default='AC', null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    delivery_address_line_1 = models.CharField(max_length=255, null=True, blank=True)
    delivery_address_line_2 = models.CharField(max_length=255, null=True, blank=True)
    delivery_city = models.CharField(max_length=100, null=True, blank=True)
    delivery_county = models.CharField(max_length=100, null=True, blank=True)
    delivery_postcode = models.CharField(max_length=20, null=True, blank=True)
    delivery_country = models.CharField(max_length=100, null=True, blank=True)
    billing_address_line_1 = models.CharField(max_length=255, null=True, blank=True)
    billing_address_line_2 = models.CharField(max_length=255, null=True, blank=True)
    billing_city = models.CharField(max_length=100, null=True, blank=True)
    billing_county = models.CharField(max_length=100, null=True, blank=True)
    billing_postcode = models.CharField(max_length=20, null=True, blank=True)
    billing_country = models.CharField(max_length=100, null=True, blank=True)
    logistics_address_line_1 = models.CharField(max_length=255, null=True, blank=True)
    logistics_address_line_2 = models.CharField(max_length=255, null=True, blank=True)
    logistics_city = models.CharField(max_length=100, null=True, blank=True)
    logistics_county = models.CharField(max_length=100, null=True, blank=True)
    logistics_postcode = models.CharField(max_length=20, null=True, blank=True)
    logistics_country = models.CharField(max_length=100, null=True, blank=True)
    os_contact = models.CharField(max_length=200, null=True, blank=True)
    delivery_windows = models.CharField(max_length=200, null=True, blank=True)
    project_description = models.TextField(null=True, blank=True)
    project_code = models.CharField(max_length=200, null=True, blank=True)
    rooms = models.ManyToManyField(Room, blank=True)
    contractor = models.ForeignKey(Client, null=True, blank=True, on_delete=models.SET_NULL, related_name='contractor_projects')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    timezone = models.CharField(max_length=200, blank=True, null=True)
    phases = models.ManyToManyField(Phase, blank=True)
    total_budget = models.FloatField(null=True, blank=True)
    vt_rate = models.FloatField(null=True, blank=True)
    ffne = models.FloatField(null=True, blank=True)
    currency = models.CharField(max_length=200, null=True, blank=True)
    payment_schedule = models.CharField(max_length=200, null=True, blank=True, choices=PAYMENT_SCHEDULE)
    procurement_client_access = models.BooleanField(default=False, null=True, blank=True)
    secondary_client = models.ManyToManyField(
        Client,
        blank=True,
        related_name='secondary_projects',
        help_text='Additional clients who have access to this project in the client portal.',
    )
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_projects')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='projects_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='projects_updated', null=True, blank=True)
    project_banner = models.ImageField(upload_to='project_banners/', null=True, blank=True)
    access_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    # Public studio profile / portfolio
    portfolio_featured = models.BooleanField(default=False)
    portfolio_title = models.CharField(max_length=200, null=True, blank=True)
    portfolio_summary = models.TextField(null=True, blank=True)
    portfolio_order = models.PositiveIntegerField(default=0)
    hide_client_on_profile = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.project_name}-{self.client}"

class Procurement(models.Model):
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    unit_type = models.CharField(max_length=200, choices=PROCUREMENT_UNIT_TYPE, blank=True, null=True, default='EA')
    po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    catalog_product = models.ForeignKey(
        'supplier_portal.CatalogProduct',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='procurements',
    )
    sample = models.CharField(max_length=200, choices=SAMPLE_CHOICE, null=True, blank=True)
    order_date = models.DateField(null=True, blank=True)
    lead_time = models.CharField(max_length=200, blank=True, null=True)
    quantity = models.FloatField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=200, default='IR', null=True, blank=True, choices=PROCUREMENT_STATUS)
    client_approval = models.CharField(max_length=200, choices=CLIENT_APPROVAL_STATUS, null=True, blank=True)
    po_created = models.BooleanField(default=False, null=True, blank=True)
    po_sent = models.BooleanField(default=False, null=True, blank=True)
    po_received = models.BooleanField(default=False, null=True, blank=True)
    inv_created = models.BooleanField(default=False, null=True, blank=True)
    inv_sent = models.BooleanField(default=False, null=True, blank=True)
    inv_received = models.BooleanField(default=False, null=True, blank=True)
    lead_time = models.CharField(max_length=200, null=True, blank=True)
    logistic_status = models.CharField(max_length=200, choices=LOGISTIC_STATUS_TYPE, null=True, blank=True, default='NO')
    ETA = models.DateField(null=True, blank=True)
    tracking_number = models.CharField(max_length=200, null=True, blank=True)
    client_access = models.BooleanField(default=False, null=True, blank=True)
    contractor_access = models.BooleanField(default=False, null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    comments = models.ManyToManyField(Comments, blank=True)
    internally_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='procurements_internally_approved', null=True, blank=True)
    internally_approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='procurements_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='procurements_updated', null=True, blank=True)

    def __str__(self):
        return f"{self.studio}{self.project}-{self.room}-{self.product}"


class ProjectProposalToken(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='proposal_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expires_at = timezone.now() + timezone.timedelta(days=30)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.accepted and timezone.now() < self.expires_at
