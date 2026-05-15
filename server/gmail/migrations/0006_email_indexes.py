from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gmail', '0005_email_snippet'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='email',
            index=models.Index(fields=['thread_id'], name='gmail_email_thread_id_idx'),
        ),
        migrations.AddIndex(
            model_name='email',
            index=models.Index(fields=['studio', 'received_at'], name='gmail_email_studio_received_idx'),
        ),
        migrations.AddIndex(
            model_name='email',
            index=models.Index(fields=['studio', 'thread_id'], name='gmail_email_studio_thread_idx'),
        ),
        migrations.AddIndex(
            model_name='email',
            index=models.Index(fields=['studio', 'thread_id', 'received_at'], name='gmail_email_studio_thread_recv_idx'),
        ),
    ]
