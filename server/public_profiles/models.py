import re
from django.db import models
from django.core.exceptions import ValidationError
from users.models import Studio, User

SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
RESERVED_SLUGS = frozenset({
    'admin', 'api', 'app', 'auth', 'blog', 'changelog', 'compare', 'contact',
    'login', 'pricing', 'privacy', 'register', 'settings', 'studio', 'studios',
    'terms', 'www', 'focuspilot', 'support', 'help', 'about', 'home',
})


def validate_public_slug(value: str):
    if not value or len(value) < 3 or len(value) > 80:
        raise ValidationError('Slug must be 3–80 characters.')
    if value in RESERVED_SLUGS:
        raise ValidationError('This URL is reserved.')
    if not SLUG_RE.match(value):
        raise ValidationError('Use lowercase letters, numbers, and hyphens only.')


class StudioPublicProfile(models.Model):
    """LinkedIn-style public page for a design studio."""
    studio = models.OneToOneField(
        Studio, on_delete=models.CASCADE, related_name='public_profile',
    )
    slug = models.SlugField(max_length=80, unique=True, validators=[validate_public_slug])
    is_published = models.BooleanField(default=False)

    headline = models.CharField(max_length=200, blank=True, default='')
    tagline = models.CharField(max_length=300, blank=True, default='')
    about = models.TextField(blank=True, default='')
    cover_image = models.ImageField(upload_to='studio_public/covers/', null=True, blank=True)

    location_display = models.CharField(max_length=200, blank=True, default='')
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    team_size_display = models.CharField(max_length=80, blank=True, default='')
    services = models.JSONField(default=list, blank=True)  # list of strings
    specialties = models.JSONField(default=list, blank=True)  # list of strings

    website_url = models.URLField(blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')
    instagram_url = models.URLField(blank=True, default='')
    pinterest_url = models.URLField(blank=True, default='')
    houzz_url = models.URLField(blank=True, default='')

    show_team = models.BooleanField(default=True)
    contact_email_public = models.EmailField(blank=True, default='')
    contact_phone_public = models.CharField(max_length=30, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.studio} ({self.slug})'


PROJECT_TYPE_LABELS = {
    'RS': 'Residential',
    'CM': 'Commercial',
    'HS': 'Hospitality',
}


class StudioPortfolioItem(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='portfolio_items')
    project = models.ForeignKey(
        'projects.Project', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='portfolio_entries',
    )
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    project_type = models.CharField(max_length=10, blank=True, default='')
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    image = models.ImageField(upload_to='studio_public/portfolio/', null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f'{self.studio} | {self.title}'


class StudioReview(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='public_reviews')
    author_name = models.CharField(max_length=120)
    author_title = models.CharField(max_length=200, blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5)  # 1–5
    body = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f'{self.studio} | {self.author_name}'


class StudioPublicTeamMember(models.Model):
    """Optional curated team list for public profile (falls back to studio users)."""
    profile = models.ForeignKey(
        StudioPublicProfile, on_delete=models.CASCADE, related_name='team_highlights',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=120)
    title = models.CharField(max_length=200, blank=True, default='')
    sort_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.name
