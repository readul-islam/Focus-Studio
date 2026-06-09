from django.db import models
from decimal import Decimal
from crm.models import Client
from users.models import Studio, User

PO_STATUS = [
    ('DFT', 'Draft'),
    ('SNT', 'Sent'),
    ('APR', 'Approved'),
    ('PD', 'Paid'),
]

INVOICE_STATUS = [
    ('DFT', 'Draft'),
    ('SNT', 'Sent'),
    ('PD', 'Paid'),
    ('OVD', 'Overdue'),
]

class PurchaseOrder(models.Model):
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True)
    supplier = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=PO_STATUS, default='DFT')
    date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)  
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='GBP')
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_charge = models.FloatField(null=True, blank=True, default=0)
    
    trade_invoice = models.FileField(upload_to='trade_invoices/', null=True, blank=True, help_text="Supplier trade invoice PDF")

    # Xero integration fields
    xero_sync = models.BooleanField(default=True, help_text="Enable sync with Xero")
    xero_id = models.CharField(max_length=255, null=True, blank=True, help_text="Xero bill ID")
    xero_invoice_number = models.CharField(max_length=255, null=True, blank=True, help_text="Xero-generated invoice number")
    xero_sync_status = models.CharField(max_length=20, null=True, blank=True, help_text="Sync status: pending, synced, failed")
    xero_sync_error = models.TextField(null=True, blank=True, help_text="Error message if sync fails")
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='purchase_orders_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='purchase_orders_updated', null=True, blank=True)

    def __str__(self):
        return f"PO-{self.id}"

class POLineItem(models.Model):
    po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, related_name='line_items', null=True, blank=True)
    product = models.ForeignKey('library.Product', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    account_code = models.CharField(max_length=50, default='200', help_text="Xero account code")

    def save(self, *args, **kwargs):
        self.total = Decimal(str(self.quantity)) * Decimal(str(self.unit_price))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"PO-{self.po.id if self.po else 'None'} Item: {self.description}"

class Invoice(models.Model):
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    purchase_orders = models.ManyToManyField(PurchaseOrder, blank=True, related_name='invoices')
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='DFT')
    date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='GBP')
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    ffne  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ffne_desc = models.CharField(max_length=255, null=True, blank=True)
    delivery_charge = models.FloatField(null=True, blank=True)

    # Stripe client portal payments
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Xero integration fields
    xero_sync = models.BooleanField(default=True, help_text="Enable sync with Xero")
    xero_id = models.CharField(max_length=255, null=True, blank=True, help_text="Xero invoice ID")
    xero_invoice_number = models.CharField(max_length=255, null=True, blank=True, help_text="Xero-generated invoice number")
    xero_sync_status = models.CharField(max_length=20, null=True, blank=True, help_text="Sync status: pending, synced, failed")
    xero_sync_error = models.TextField(null=True, blank=True, help_text="Error message if sync fails")
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='invoices_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='invoices_updated', null=True, blank=True)

    def __str__(self):
        return f"INV-{self.id}"

class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, related_name='line_items', null=True, blank=True)
    product = models.ForeignKey('library.Product', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    account_code = models.CharField(max_length=50, default='200', help_text="Xero account code")

    def save(self, *args, **kwargs):
        self.total = Decimal(str(self.quantity)) * Decimal(str(self.unit_price))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"INV-{self.invoice.id if self.invoice else 'None'} Item: {self.description}"
