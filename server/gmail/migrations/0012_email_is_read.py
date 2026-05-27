from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmail', '0011_email_attachments'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='is_read',
            field=models.BooleanField(default=True),
        ),
    ]
