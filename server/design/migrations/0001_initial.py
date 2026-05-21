import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0027_userappearancepreferences_product_tours'),
    ]

    operations = [
        migrations.CreateModel(
            name='DesignSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='New design', max_length=255)),
                ('design_type', models.CharField(choices=[('interior', 'Interior'), ('exterior', 'Exterior')], default='interior', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='design_sessions', to='users.studio')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='design_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='DesignAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.ImageField(upload_to='design_assets/%Y/%m/')),
                ('prompt', models.TextField(blank=True)),
                ('source_sketch', models.ImageField(blank=True, null=True, upload_to='design_sketches/%Y/%m/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assets', to='design.designsession')),
            ],
        ),
        migrations.CreateModel(
            name='DesignMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('user', 'User'), ('assistant', 'Assistant')], max_length=20)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('asset', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='messages', to='design.designasset')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='design.designsession')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]
