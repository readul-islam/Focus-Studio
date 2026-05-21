from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('design', '0002_designmessage_sketch'),
    ]

    operations = [
        migrations.AddField(
            model_name='designasset',
            name='asset_type',
            field=models.CharField(
                choices=[('image', '2D Image'), ('model_3d', '3D Model')],
                default='image',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='designasset',
            name='model_file',
            field=models.FileField(blank=True, null=True, upload_to='design_models/%Y/%m/'),
        ),
        migrations.AddField(
            model_name='designasset',
            name='meshy_task_id',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AlterField(
            model_name='designasset',
            name='file',
            field=models.ImageField(blank=True, null=True, upload_to='design_assets/%Y/%m/'),
        ),
    ]
