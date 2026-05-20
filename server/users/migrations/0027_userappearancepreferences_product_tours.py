from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_usertwofactor'),
    ]

    operations = [
        migrations.AddField(
            model_name='userappearancepreferences',
            name='product_tours_completed',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
