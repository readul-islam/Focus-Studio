from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='designmessage',
            name='sketch',
            field=models.ImageField(blank=True, null=True, upload_to='design_sketches/%Y/%m/'),
        ),
    ]
