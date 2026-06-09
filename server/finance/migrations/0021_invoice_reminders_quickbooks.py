from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0020_invoice_stripe_payment'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='last_reminder_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='reminder_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='invoice',
            name='qb_id',
            field=models.CharField(blank=True, help_text='QuickBooks invoice ID', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='qb_sync',
            field=models.BooleanField(default=True, help_text='Enable sync with QuickBooks'),
        ),
        migrations.AddField(
            model_name='invoice',
            name='qb_sync_error',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='qb_sync_status',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
