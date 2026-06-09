from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0019_invoice_purchase_orders'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='paid_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='stripe_checkout_session_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='stripe_payment_intent_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
