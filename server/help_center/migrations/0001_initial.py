import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='HelpArticleFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=80)),
                ('article_slug', models.CharField(max_length=120)),
                ('rating', models.CharField(choices=[('helpful', 'Helpful'), ('not_helpful', 'Not helpful')], max_length=20)),
                ('comment', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='help_feedbacks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'indexes': [
                    models.Index(fields=['category', 'article_slug'], name='help_center_categor_6a8f0d_idx'),
                    models.Index(fields=['created_at'], name='help_center_created_8e2b41_idx'),
                ],
            },
        ),
    ]
