import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0028_procurement_unit_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='access_token',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
