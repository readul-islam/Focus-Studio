from django.db import models
from crm.models import Client
from projects.models import Project, Procurement
from documents.models import Document


class ContractorProfile(models.Model):
    """
    Stores contractor-specific fields that extend the base Client model.
    Linked 1-to-1 with a Client whose contact_type='CN'.
    """
    contractor = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name='contractor_profile',
    )
    access_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    trade = models.CharField(max_length=200, null=True, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    insurance_document = models.FileField(upload_to='contractor_insurance/', null=True, blank=True)
    trade_cert = models.FileField(upload_to='contractor_trade_certs/', null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=200, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = 'Contractor Profile'
        verbose_name_plural = 'Contractor Profiles'

    def __str__(self):
        return f"Profile for {self.contractor.name} ({self.access_code})"


class ContractorProject(models.Model):
    """
    Links contractors to projects they can access in the contractor portal.
    """
    contractor = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='contractor_portal_projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='contractor_access_grants')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contractor', 'project')
        verbose_name = 'Contractor Project Access'
        verbose_name_plural = 'Contractor Project Access'

    def __str__(self):
        return f"{self.contractor.name} - {self.project.project_name}"


class ContractorSharedProcurement(models.Model):
    """
    Tracks procurement items shared with a specific contractor (CN).
    """
    contractor = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='shared_procurements'
    )
    procurement = models.ForeignKey(
        Procurement, on_delete=models.CASCADE, related_name='contractor_shares'
    )
    shared_at = models.DateTimeField(auto_now_add=True)
    viewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('contractor', 'procurement')
        verbose_name = 'Contractor Shared Procurement'
        verbose_name_plural = 'Contractor Shared Procurements'

    def __str__(self):
        return f"{self.contractor.name} - {self.procurement}"


class ContractorSharedDocument(models.Model):
    """
    Tracks documents/drawings shared with a specific contractor (CN).
    """
    contractor = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='shared_documents'
    )
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='contractor_shares'
    )
    shared_at = models.DateTimeField(auto_now_add=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    confirmed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('contractor', 'document')
        verbose_name = 'Contractor Shared Document'
        verbose_name_plural = 'Contractor Shared Documents'

    def __str__(self):
        return f"{self.contractor.name} - {self.document.name}"


class ContractorMessage(models.Model):
    """
    Messages between studio and contractor for a project.
    """
    SENDER_CHOICES = [
        ('studio', 'Studio'),
        ('contractor', 'Contractor'),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='contractor_messages'
    )
    contractor = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='contractor_messages'
    )
    content = models.TextField()
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Contractor Message'
        verbose_name_plural = 'Contractor Messages'

    def __str__(self):
        return f"{self.sender_type} message in {self.project.project_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
