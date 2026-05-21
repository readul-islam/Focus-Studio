from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager
from django.utils import timezone
from datetime import timedelta
import uuid
import hashlib
import secrets

class Studio(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True)
    support_email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address_line_1 = models.CharField(max_length=255, null=True, blank=True)
    address_line_2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    default_currency = models.CharField(max_length=3, null=True, blank=True)
    default_tax_rate = models.FloatField(null=True, blank=True)
    xero = models.BooleanField(default=False, null=True, blank=True)
    notion = models.BooleanField(default=False, null=True, blank=True)
    # Branding
    primary_logo = models.ImageField(upload_to='studio_branding/', null=True, blank=True)
    monochrome_logo = models.ImageField(upload_to='studio_branding/', null=True, blank=True)
    primary_color = models.CharField(max_length=20, null=True, blank=True)
    secondary_color = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.name


ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('manager', 'Manager'),
    ('member', 'Member'),
]

PERMISSION_CHOICES = [
    ('projects.view', 'Projects • view'),
    ('projects.edit', 'Projects • edit'),
    ('projects.delete', 'Projects • delete'),
    ('tasks.view', 'Tasks • view'),
    ('tasks.edit', 'Tasks • edit'),
    ('tasks.delete', 'Tasks • delete'),
    ('finance.view', 'Finance • view'),
    ('finance.edit', 'Finance • edit'),
    ('finance.delete', 'Finance • delete'),
    ('clients.view', 'Clients • view'),
    ('clients.edit', 'Clients • edit'),
    ('clients.delete', 'Clients • delete'),
    ('library.view', 'Library • view'),
    ('library.edit', 'Library • edit'),
    ('library.delete', 'Library • delete'),
    ('procurement.view', 'Procurement • view'),
    ('procurement.edit', 'Procurement • edit'),
    ('procurement.delete', 'Procurement • delete'),
    ('documents.view', 'Documents • view'),
    ('documents.edit', 'Documents • edit'),
    ('documents.delete', 'Documents • delete'),
    ('reports.view', 'Reports • view'),
    ('design.view', 'Design • view'),
    ('design.edit', 'Design • edit'),
    ('team.view', 'Team • view'),
    ('team.edit', 'Team • edit'),
    ('team.delete', 'Team • delete'),
    ('settings.edit', 'Settings • edit'),
]


class RolePermission(models.Model):
    """
    Per-studio permissions matrix. One row per (studio, role, permission) triple.
    Admin rows are read-only (always True) and seeded on studio creation.
    """
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='role_permissions')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    permission = models.CharField(max_length=50, choices=PERMISSION_CHOICES)
    enabled = models.BooleanField(default=False)

    class Meta:
        unique_together = ('studio', 'role', 'permission')

    def __str__(self):
        return f"{self.studio} | {self.role} | {self.permission} = {self.enabled}"


class ProjectTemplate(models.Model):
    """
    A named bundle of phases (and their default tasks) that can be applied
    when creating a new project.
    """
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='project_templates')
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.studio} | {self.name}"


class StudioPhaseTemplate(models.Model):
    """
    A phase within a ProjectTemplate, with optional default tasks.
    """
    template = models.ForeignKey(ProjectTemplate, on_delete=models.CASCADE, related_name='phases', null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='phase_templates')
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=20, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.studio} | {self.name}"


class StudioDefaultTask(models.Model):
    """
    Default tasks seeded into a phase when a new project is created.
    """
    phase_template = models.ForeignKey(StudioPhaseTemplate, on_delete=models.CASCADE, related_name='default_tasks')
    title = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.phase_template.name} | {self.title}"

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    title = models.CharField(max_length=200, null=True, blank=True)
    pay_per_hour = models.FloatField(null=True, blank=True, default=0.0)
    hours_per_week = models.FloatField(null=True, blank=True, default=0.0)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    gmail = models.BooleanField(default=False, null=True, blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Invitation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
    )
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='sent_invitations', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation to {self.email} from {self.sender.email}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"PasswordResetToken for {self.user.email}"


class UserNotificationPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    project_updates = models.BooleanField(default=True)
    comments = models.BooleanField(default=True)
    reminders = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)

    def __str__(self):
        return f"Notifications for {self.user.email}"


THEME_CHOICES = [
    ('system', 'System'),
    ('light', 'Light'),
    ('dark', 'Dark'),
]

DENSITY_CHOICES = [
    ('comfortable', 'Comfortable'),
    ('compact', 'Compact'),
    ('spacious', 'Spacious'),
]


class UserAppearancePreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='appearance_preferences')
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='system')
    density = models.CharField(max_length=20, choices=DENSITY_CHOICES, default='comfortable')
    accent_color = models.CharField(max_length=20, null=True, blank=True)
    product_tours_completed = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Appearance for {self.user.email}"


OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


class OtpVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp_verification')
    otp_hash = models.CharField(max_length=64)  # SHA-256 hex of the 6-digit OTP
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_for(cls, user):
        """Create (or replace) an OTP record for the user. Returns the plain OTP."""
        otp = ''.join(secrets.choice('0123456789') for _ in range(6))
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        cls.objects.update_or_create(
            user=user,
            defaults={
                'otp_hash': otp_hash,
                'expires_at': timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES),
                'attempts': 0,
            },
        )
        return otp

    def is_valid(self, otp: str) -> bool:
        if timezone.now() > self.expires_at:
            return False
        if self.attempts >= MAX_OTP_ATTEMPTS:
            return False
        return hashlib.sha256(otp.encode()).hexdigest() == self.otp_hash

    def record_attempt(self):
        self.attempts += 1
        self.save(update_fields=['attempts'])

    def __str__(self):
        return f"OTP for {self.user.email} (expires {self.expires_at})"


class UserTwoFactor(models.Model):
    """Authenticator-app TOTP for studio users."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor')
    totp_secret_signed = models.TextField(blank=True, default='')
    is_enabled = models.BooleanField(default=False)
    backup_codes_hashes = models.JSONField(default=list, blank=True)
    enabled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        state = 'enabled' if self.is_enabled else 'disabled'
        return f'2FA ({state}) for {self.user.email}'
