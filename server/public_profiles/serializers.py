from rest_framework import serializers
from users.models import User
from projects.models import Project, PROJECT_TYPE
from .models import (
    StudioPublicProfile, StudioPortfolioItem, StudioReview,
    StudioPublicTeamMember, validate_public_slug, PROJECT_TYPE_LABELS,
)
from .utils import absolute_media_url


class StudioPortfolioItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    project_type_label = serializers.SerializerMethodField()

    class Meta:
        model = StudioPortfolioItem
        fields = [
            'id', 'project', 'title', 'summary', 'location', 'project_type',
            'project_type_label', 'year', 'image', 'image_url', 'sort_order',
            'is_featured', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            return absolute_media_url(self.context.get('request'), obj.image)
        if obj.project and obj.project.project_banner:
            return absolute_media_url(self.context.get('request'), obj.project.project_banner)
        return None

    def get_project_type_label(self, obj):
        return PROJECT_TYPE_LABELS.get(obj.project_type, obj.project_type or '')


class StudioReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioReview
        fields = [
            'id', 'author_name', 'author_title', 'rating', 'body',
            'sort_order', 'is_published', 'created_at',
        ]
        read_only_fields = ['created_at']


class StudioPublicTeamMemberSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = StudioPublicTeamMember
        fields = ['id', 'user', 'name', 'title', 'sort_order', 'is_visible', 'profile_picture_url']

    def get_profile_picture_url(self, obj):
        if obj.user and obj.user.profile_picture:
            return absolute_media_url(self.context.get('request'), obj.user.profile_picture)
        return None


class PublicTeamMemberSerializer(serializers.Serializer):
    """Safe team card for public pages."""
    name = serializers.CharField()
    title = serializers.CharField(allow_blank=True)
    profile_picture_url = serializers.CharField(allow_null=True)


class StudioPublicProfileManageSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()
    studio_name = serializers.CharField(max_length=200, required=False, allow_blank=True)

    class Meta:
        model = StudioPublicProfile
        fields = [
            'id', 'slug', 'is_published', 'headline', 'tagline', 'about',
            'cover_image', 'cover_image_url', 'logo_url', 'studio_name',
            'location_display', 'founded_year', 'team_size_display',
            'services', 'specialties', 'website_url', 'linkedin_url',
            'instagram_url', 'pinterest_url', 'houzz_url', 'show_team',
            'contact_email_public', 'contact_phone_public',
            'public_url', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'public_url', 'logo_url', 'cover_image_url']

    def get_cover_image_url(self, obj):
        return absolute_media_url(self.context.get('request'), obj.cover_image)

    def get_logo_url(self, obj):
        if obj.studio.primary_logo:
            return absolute_media_url(self.context.get('request'), obj.studio.primary_logo)
        return None

    def get_public_url(self, obj):
        from django.conf import settings
        base = settings.PUBLIC_PROFILE_BASE_URL
        return f'{base.rstrip("/")}/{obj.slug}'

    def validate_slug(self, value):
        validate_public_slug(value)
        qs = StudioPublicProfile.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This URL is already taken.')
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['studio_name'] = instance.studio.name or ''
        return data

    def update(self, instance, validated_data):
        studio_name = validated_data.pop('studio_name', None)
        instance = super().update(instance, validated_data)
        if studio_name is not None:
            studio = instance.studio
            studio.name = studio_name.strip()
            studio.save(update_fields=['name'])
        return instance


class PublicStudioProfileSerializer(serializers.Serializer):
    """Aggregated public payload — no sensitive fields."""
    slug = serializers.CharField()
    studio_name = serializers.CharField()
    headline = serializers.CharField()
    tagline = serializers.CharField()
    about = serializers.CharField()
    cover_image_url = serializers.CharField(allow_null=True)
    logo_url = serializers.CharField(allow_null=True)
    location_display = serializers.CharField()
    founded_year = serializers.IntegerField(allow_null=True)
    team_size_display = serializers.CharField()
    services = serializers.ListField(child=serializers.CharField())
    specialties = serializers.ListField(child=serializers.CharField())
    website_url = serializers.CharField()
    linkedin_url = serializers.CharField()
    instagram_url = serializers.CharField()
    pinterest_url = serializers.CharField()
    houzz_url = serializers.CharField()
    contact_email_public = serializers.CharField()
    contact_phone_public = serializers.CharField()
    portfolio = StudioPortfolioItemSerializer(many=True)
    reviews = StudioReviewSerializer(many=True)
    team = PublicTeamMemberSerializer(many=True)
    average_rating = serializers.FloatField(allow_null=True)
    review_count = serializers.IntegerField()


class ProjectPortfolioCandidateSerializer(serializers.ModelSerializer):
    """Projects the owner can import into portfolio."""
    image_url = serializers.SerializerMethodField()
    already_in_portfolio = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'project_name', 'project_type', 'project_status', 'location',
            'project_description', 'start_date', 'end_date', 'image_url',
            'already_in_portfolio', 'portfolio_featured', 'portfolio_title',
            'portfolio_summary', 'portfolio_order', 'hide_client_on_profile',
        ]

    def get_image_url(self, obj):
        if obj.project_banner:
            return absolute_media_url(self.context.get('request'), obj.project_banner)
        return None

    def get_already_in_portfolio(self, obj):
        return obj.portfolio_entries.exists()
