from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collaboration', '0002_team_message_attachments'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectteammessage',
            name='is_pinned',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='projectteammessage',
            name='pinned_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
