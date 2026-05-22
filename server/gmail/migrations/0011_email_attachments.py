from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmail', '0010_email_suggested_tasks_remove_threadsummary_suggested_tasks'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='attachments',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
