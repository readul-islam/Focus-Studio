from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0002_alter_studiosubscription_plan_tier'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studiosubscription',
            name='plan_tier',
            field=models.CharField(
                blank=True,
                choices=[
                    ('beta', 'Beta Access'),
                    ('solo', 'Solo'),
                    ('starter', 'Starter'),
                    ('professional', 'Professional'),
                    ('enterprise', 'Enterprise'),
                ],
                max_length=32,
                null=True,
            ),
        ),
    ]
