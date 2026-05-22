from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User, Studio, Invitation,
    RolePermission, StudioPhaseTemplate, StudioDefaultTask, ProjectTemplate,
    UserNotificationPreferences, UserAppearancePreferences,
)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses here
        data['user'] = UserSerializer(self.user).data
        return data


class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    studio = StudioSerializer(read_only=True)
    is_2fa_enabled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'studio', 'role', 'phone_number', 'title',
            'pay_per_hour', 'hours_per_week', 'profile_picture', 'cover_image', 'is_2fa_enabled',
        ]

    def get_is_2fa_enabled(self, obj):
        tf = getattr(obj, 'two_factor', None)
        return bool(tf and tf.is_enabled)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    studio_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'studio_name', 'phone_number']

    def create(self, validated_data):
        studio_name = validated_data.pop('studio_name', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data, password=password)

        if studio_name:
            studio, created = Studio.objects.get_or_create(name=studio_name)
            user.studio = studio
            user.save()
        
        return user

class InvitationSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=['admin', 'manager', 'member'],
        default='member',
        write_only=True,
        required=False,
    )

    class Meta:
        model = Invitation
        fields = ['email', 'token', 'status', 'created_at', 'role']
        read_only_fields = ['token', 'status', 'created_at']

class StudioBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['primary_logo', 'monochrome_logo', 'primary_color', 'secondary_color']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        for key in ('primary_logo', 'monochrome_logo'):
            field = getattr(instance, key, None)
            if field:
                url = field.url
                data[key] = request.build_absolute_uri(url) if request else url
            else:
                data[key] = None
        return data


class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission', 'enabled']


class StudioDefaultTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioDefaultTask
        fields = ['id', 'title', 'order']


class StudioPhaseTemplateSerializer(serializers.ModelSerializer):
    default_tasks = StudioDefaultTaskSerializer(many=True, required=False)

    class Meta:
        model = StudioPhaseTemplate
        fields = ['id', 'name', 'color', 'order', 'default_tasks']

    def create(self, validated_data):
        tasks_data = validated_data.pop('default_tasks', [])
        phase = StudioPhaseTemplate.objects.create(**validated_data)
        for i, task in enumerate(tasks_data):
            StudioDefaultTask.objects.create(phase_template=phase, order=i, **task)
        return phase

    def update(self, instance, validated_data):
        tasks_data = validated_data.pop('default_tasks', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tasks_data is not None:
            instance.default_tasks.all().delete()
            for i, task in enumerate(tasks_data):
                StudioDefaultTask.objects.create(phase_template=instance, order=i, **task)
        return instance


class ProjectTemplateSerializer(serializers.ModelSerializer):
    phases = StudioPhaseTemplateSerializer(many=True, required=False)

    class Meta:
        model = ProjectTemplate
        fields = ['id', 'name', 'phases']

    def create(self, validated_data):
        phases_data = validated_data.pop('phases', [])
        studio = validated_data.pop('studio')
        template = ProjectTemplate.objects.create(studio=studio, **validated_data)
        for i, phase_data in enumerate(phases_data):
            tasks_data = phase_data.pop('default_tasks', [])
            phase = StudioPhaseTemplate.objects.create(
                template=template, studio=studio, order=i, **phase_data
            )
            for j, task in enumerate(tasks_data):
                StudioDefaultTask.objects.create(phase_template=phase, order=j, **task)
        return template

    def update(self, instance, validated_data):
        phases_data = validated_data.pop('phases', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        if phases_data is not None:
            instance.phases.all().delete()
            studio = instance.studio
            for i, phase_data in enumerate(phases_data):
                tasks_data = phase_data.pop('default_tasks', [])
                phase = StudioPhaseTemplate.objects.create(
                    template=instance, studio=studio, order=i, **phase_data
                )
                for j, task in enumerate(tasks_data):
                    StudioDefaultTask.objects.create(phase_template=phase, order=j, **task)
        return instance


class UserNotificationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationPreferences
        fields = ['project_updates', 'comments', 'reminders', 'marketing_emails']


class UserAppearancePreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAppearancePreferences
        fields = ['theme', 'density', 'accent_color', 'product_tours_completed']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'Passwords do not match.'})
        return attrs


class AcceptInvitationSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)
    name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    def validate_token(self, value):
        """Validate that the token exists and is pending"""
        try:
            invitation = Invitation.objects.get(token=value)
            if invitation.status != 'PENDING':
                raise serializers.ValidationError('This invitation has already been accepted.')
            return value
        except Invitation.DoesNotExist:
            raise serializers.ValidationError('Invalid invitation token.')
    
    def validate(self, attrs):
        """Validate that new users provide name and password"""
        token = attrs.get('token')
        invitation = Invitation.objects.get(token=token)
        
        # Check if user already exists
        user_exists = User.objects.filter(email=invitation.email).exists()
        
        if not user_exists:
            # New user must provide name and password
            if not attrs.get('name'):
                raise serializers.ValidationError({'name': 'Name is required for new users.'})
            if not attrs.get('password'):
                raise serializers.ValidationError({'password': 'Password is required for new users.'})
        
        return attrs
