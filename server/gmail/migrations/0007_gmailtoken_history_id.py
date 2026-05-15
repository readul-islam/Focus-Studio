from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmail', '0006_email_indexes'),
    ]

    operations = [
        migrations.AddField(
            model_name='gmailtoken',
            name='history_id',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
