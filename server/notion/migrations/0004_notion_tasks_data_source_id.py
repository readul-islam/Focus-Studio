from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notion', '0003_outbound_sync'),
    ]

    operations = [
        migrations.AddField(
            model_name='notionprojectsync',
            name='notion_tasks_data_source_id',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Notion data source id for querying task rows (API 2025-09-03+).',
                max_length=64,
            ),
        ),
    ]
