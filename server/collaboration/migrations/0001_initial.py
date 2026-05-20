import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0029_project_access_token'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0018_studio_address_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectTeamMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='collaboration.projectteammessage')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team_messages', to='projects.project')),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team_messages', to='users.studio')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='team_messages_sent', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Project Team Message',
                'verbose_name_plural': 'Project Team Messages',
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProjectPresence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_seen', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='presence_records', to='projects.project')),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_presence', to='users.studio')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_presence', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Project Presence',
                'verbose_name_plural': 'Project Presence Records',
                'unique_together': {('project', 'user')},
            },
        ),
    ]
