from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0032_alter_rolepermission_permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='studio',
            name='stripe_connect_account_id',
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='studio',
            name='stripe_connect_charges_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studio',
            name='stripe_connect_onboarded',
            field=models.BooleanField(default=False),
        ),
    ]
