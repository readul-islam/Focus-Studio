from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0009_subtask_assignees'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='task_attachments/%Y/%m/')),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField(default=0)),
                ('content_type', models.CharField(blank=True, default='', max_length=128)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='task.task')),
            ],
            options={
                'verbose_name': 'Task Attachment',
                'verbose_name_plural': 'Task Attachments',
                'ordering': ['created_at'],
            },
        ),
    ]
