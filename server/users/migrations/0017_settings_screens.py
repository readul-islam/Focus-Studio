from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_user_profile_picture'),
    ]

    operations = [
        # Branding fields on Studio
        migrations.AddField(
            model_name='studio',
            name='primary_logo',
            field=models.ImageField(blank=True, null=True, upload_to='studio_branding/'),
        ),
        migrations.AddField(
            model_name='studio',
            name='monochrome_logo',
            field=models.ImageField(blank=True, null=True, upload_to='studio_branding/'),
        ),
        migrations.AddField(
            model_name='studio',
            name='primary_color',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='studio',
            name='secondary_color',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),

        # RolePermission
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('admin', 'Admin'), ('manager', 'Manager'), ('member', 'Member')], max_length=20)),
                ('permission', models.CharField(choices=[('projects.view', 'Projects \u2022 view'), ('projects.edit', 'Projects \u2022 edit'), ('tasks.view', 'Tasks \u2022 view'), ('tasks.edit', 'Tasks \u2022 edit'), ('finance.view', 'Finance \u2022 view'), ('finance.edit', 'Finance \u2022 edit'), ('clients.view', 'Clients \u2022 view'), ('clients.edit', 'Clients \u2022 edit'), ('procurement.view', 'Procurement \u2022 view'), ('procurement.edit', 'Procurement \u2022 edit'), ('documents.view', 'Documents \u2022 view'), ('documents.edit', 'Documents \u2022 edit'), ('reports.view', 'Reports \u2022 view'), ('team.view', 'Team \u2022 view'), ('team.edit', 'Team \u2022 edit'), ('settings.edit', 'Settings \u2022 edit')], max_length=50)),
                ('enabled', models.BooleanField(default=False)),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='role_permissions', to='users.studio')),
            ],
            options={
                'unique_together': {('studio', 'role', 'permission')},
            },
        ),

        # StudioPhaseTemplate
        migrations.CreateModel(
            name='StudioPhaseTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('color', models.CharField(blank=True, max_length=20, null=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phase_templates', to='users.studio')),
            ],
            options={
                'ordering': ['order'],
            },
        ),

        # StudioDefaultTask
        migrations.CreateModel(
            name='StudioDefaultTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=500)),
                ('order', models.PositiveIntegerField(default=0)),
                ('phase_template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='default_tasks', to='users.studiophasetemplate')),
            ],
            options={
                'ordering': ['order'],
            },
        ),

        # UserNotificationPreferences
        migrations.CreateModel(
            name='UserNotificationPreferences',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_updates', models.BooleanField(default=True)),
                ('comments', models.BooleanField(default=True)),
                ('reminders', models.BooleanField(default=True)),
                ('marketing_emails', models.BooleanField(default=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='notification_preferences', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        # UserAppearancePreferences
        migrations.CreateModel(
            name='UserAppearancePreferences',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('theme', models.CharField(choices=[('system', 'System'), ('light', 'Light'), ('dark', 'Dark')], default='system', max_length=20)),
                ('density', models.CharField(choices=[('comfortable', 'Comfortable'), ('compact', 'Compact'), ('spacious', 'Spacious')], default='comfortable', max_length=20)),
                ('accent_color', models.CharField(blank=True, max_length=20, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='appearance_preferences', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
