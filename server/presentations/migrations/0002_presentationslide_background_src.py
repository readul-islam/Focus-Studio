from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('presentations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='presentationslide',
            name='background_src',
            field=models.TextField(blank=True, default=''),
        ),
    ]
