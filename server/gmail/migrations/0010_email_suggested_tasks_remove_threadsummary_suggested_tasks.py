from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmail', '0009_threadsummary_suggested_tasks'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='suggested_tasks',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.RemoveField(
            model_name='threadsummary',
            name='suggested_tasks',
        ),
    ]
