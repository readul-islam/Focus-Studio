import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('meetings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='project',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='meetings',
                to='projects.project',
            ),
        ),
        migrations.AddField(
            model_name='meeting',
            name='note_status',
            field=models.CharField(
                choices=[('needs_review', 'Needs review'), ('published', 'Published')],
                default='needs_review',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='meeting',
            name='capture_source',
            field=models.CharField(
                choices=[('meeting_bot', 'Meeting bot'), ('site_visit', 'Site visit'), ('upload', 'Upload')],
                default='meeting_bot',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='native_meeting_id',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='meetingtranscript',
            name='decisions',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='meetingtranscript',
            name='risks',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='meetingactionitem',
            name='converted_task_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
