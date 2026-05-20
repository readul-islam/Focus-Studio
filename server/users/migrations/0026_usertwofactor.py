import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_studio_notion'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserTwoFactor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('totp_secret_signed', models.TextField(blank=True, default='')),
                ('is_enabled', models.BooleanField(default=False)),
                ('backup_codes_hashes', models.JSONField(blank=True, default=list)),
                ('enabled_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='two_factor', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
