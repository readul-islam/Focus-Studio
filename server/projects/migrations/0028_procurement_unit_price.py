from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0027_project_expand_address_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='procurement',
            name='unit_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
