from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.contrib.auth.hashers import make_password, check_password
from users.models import User, Studio

CONTACT_TYPES = [
    ('CL', 'Client'),
    ('SP', 'Supplier'),
    ('CN', 'Contractor'),
]

CONTACT_STATUS = [
    ('NE', 'New'),
    ('AC', 'Active'),
    ('QA', 'Qualified'),
    ('NG', 'Negotation')
]

class Client(models.Model):
    contact_type = models.CharField(max_length=200, choices=CONTACT_TYPES, default='CL', null=True, blank=True)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    surname = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=200, choices=CONTACT_STATUS, default='NE', blank=True, null=True)
    currency = models.CharField(max_length=200, null=True, blank=True)
    address_line_1 = models.CharField(max_length=255, blank=True, null=True)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    county = models.CharField(max_length=100, blank=True, null=True)
    postcode = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    additional_contacts = models.JSONField(default=list, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Client Portal Authentication fields
    password = models.CharField(max_length=128, null=True, blank=True, help_text="Hashed password for client portal access")
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Client can log into portal")

    # Supplier Trade Portal fields (only applicable when contact_type == 'SP')
    trade_login_url = models.URLField(max_length=500, null=True, blank=True, help_text="Trade portal login URL (Suppliers only)")
    supplier_user_id = models.CharField(max_length=200, null=True, blank=True, help_text="User ID for the supplier trade portal (Suppliers only)")
    supplier_password = models.CharField(max_length=200, null=True, blank=True, help_text="Password for the supplier trade portal (Suppliers only)")

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='clients_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='clients_updated', null=True, blank=True)

    def __str__(self):
        return f"{self.contact_type}-{self.name}-{self.company_name}"
    
    def set_password(self, raw_password):
        """Hash and set the password for client portal access."""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash."""
        if not self.password:
            return False
        return check_password(raw_password, self.password)

    def clean(self):
        supplier_fields = (self.trade_login_url, self.supplier_user_id, self.supplier_password)
        if any(supplier_fields) and self.contact_type != 'SP':
            raise ValidationError(
                "trade_login_url, supplier_user_id, and supplier_password can only be set on Supplier contacts."
            )

class ClientNote(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='client_notes')
    note = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note on {self.client} at {self.created_at}"


class Lead(models.Model):
    # --- Identity & Contact ---
    title = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)


    # --- Ownership & Source ---
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    source = models.CharField(max_length=100)
    referred_by = models.CharField(max_length=255, blank=True)


    # --- Pipeline Stage ---
    STAGE_CHOICES = [
    ('new', 'New'),
    ('qualified', 'Qualified'),
    ('proposal', 'Proposal'),
    ('negotiation', 'Negotiation'),
    ('won', 'Won'),
    ('lost', 'Lost'),
    ]

    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='new')
    stage_updated_at = models.DateTimeField(auto_now=True)


    # --- Qualification Data ---
    lead_type = models.CharField(max_length=50, blank=True) # Residential / Commercial
    project_type = models.CharField(max_length=100, blank=True)
    property_type = models.CharField(max_length=100, blank=True)
    property_size = models.PositiveIntegerField(null=True, blank=True)


    budget_range = models.CharField(max_length=50, blank=True)
    decision_maker_confirmed = models.BooleanField(default=False)
    timeline = models.CharField(max_length=100, blank=True)


    # --- Proposal Data ---
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proposal_type = models.CharField(max_length=100, blank=True)
    proposal_sent_date = models.DateField(null=True, blank=True)


    # --- Negotiation Data ---
    negotiation_reason = models.CharField(max_length=255, blank=True)
    revised_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)


    # --- Closure Data ---
    final_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deposit_received = models.BooleanField(default=False)
    project_start_date = models.DateField(null=True, blank=True)
    project_created = models.BooleanField(default=False)
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')


    loss_reason = models.CharField(max_length=255, blank=True)


    # --- CRM Utilities ---
    probability = models.PositiveIntegerField(default=0)
    priority = models.CharField(max_length=20, blank=True) # Low / Medium / High
    notes = models.TextField(blank=True)


    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)


PROPOSAL_STATUS = [
    ('DFT', 'Draft'),
    ('SNT', 'Sent'),
    ('ACC', 'Accepted'),
    ('DCL', 'Declined'),
]

PAYMENT_SCHEDULE_CHOICES = [
    ('50_50', '50/50 Split'),
    ('30_40_30', '30/40/30'),
    ('25_25_25_25', '25/25/25/25'),
    ('custom', 'Custom'),
]

TERMS_TYPE_CHOICES = [
    ('residential', 'Residential'),
    ('commercial', 'Commercial'),
]


class Proposal(models.Model):
    title = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='proposals')
    currency = models.CharField(max_length=3, default='GBP')
    valid_until = models.DateField(null=True, blank=True)
    cover_message = models.TextField(blank=True)

    # Scope of Work
    scope_description = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)
    terms_type = models.CharField(max_length=20, choices=TERMS_TYPE_CHOICES, default='residential', blank=True)

    # Pricing
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'))
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Payment Schedule
    payment_schedule = models.CharField(max_length=20, choices=PAYMENT_SCHEDULE_CHOICES, default='50_50')

    # Status & Meta
    status = models.CharField(max_length=3, choices=PROPOSAL_STATUS, default='DFT')
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='proposals_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def recalculate_totals(self):
        subtotal = sum(item.amount for item in self.line_items.all())
        tax = subtotal * (self.tax_rate / Decimal('100'))
        self.subtotal = subtotal
        self.tax_amount = tax.quantize(Decimal('0.01'))
        self.total = (subtotal + self.tax_amount).quantize(Decimal('0.01'))

    def __str__(self):
        return f"PROP-{self.id}: {self.title}"


class ProposalLineItem(models.Model):
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1'))
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))

    def save(self, *args, **kwargs):
        self.amount = (Decimal(str(self.quantity)) * Decimal(str(self.rate))).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"PROP-{self.proposal_id} Line: {self.description}"
