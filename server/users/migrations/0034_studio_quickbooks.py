from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0033_studio_stripe_connect'),
    ]

    operations = [
        migrations.AddField(
            model_name='studio',
            name='quickbooks',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
