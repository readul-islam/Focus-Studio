from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0034_studio_quickbooks'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuickBooksToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token', models.TextField()),
                ('refresh_token', models.TextField()),
                ('expires_at', models.DateTimeField()),
                ('realm_id', models.CharField(blank=True, default='', max_length=64)),
                ('token_type', models.CharField(blank=True, default='Bearer', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quickbooks_tokens_created', to=settings.AUTH_USER_MODEL)),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quickbooks_tokens', to='users.studio')),
            ],
            options={
                'unique_together': {('studio', 'realm_id')},
            },
        ),
    ]
