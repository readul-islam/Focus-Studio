import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collaboration', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectteammessage',
            name='content',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.CreateModel(
            name='TeamMessageAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='team_chat/%Y/%m/')),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField(default=0)),
                ('content_type', models.CharField(blank=True, default='', max_length=128)),
                (
                    'file_type',
                    models.CharField(
                        choices=[
                            ('image', 'Image'),
                            ('video', 'Video'),
                            ('pdf', 'PDF'),
                            ('document', 'Document'),
                            ('other', 'Other'),
                        ],
                        default='other',
                        max_length=20,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'message',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='attachments',
                        to='collaboration.projectteammessage',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Team Message Attachment',
                'verbose_name_plural': 'Team Message Attachments',
                'ordering': ['created_at'],
            },
        ),
    ]
