# Generated manually for billing app

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0023_otpverification'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudioSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stripe_customer_id', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ('stripe_subscription_id', models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ('plan_tier', models.CharField(blank=True, choices=[('starter', 'Starter'), ('professional', 'Professional'), ('enterprise', 'Enterprise')], max_length=32, null=True)),
                ('status', models.CharField(choices=[('incomplete', 'Incomplete'), ('incomplete_expired', 'Incomplete expired'), ('trialing', 'Trialing'), ('active', 'Active'), ('past_due', 'Past due'), ('canceled', 'Canceled'), ('unpaid', 'Unpaid'), ('paused', 'Paused')], default='incomplete', max_length=32)),
                ('trial_ends_at', models.DateTimeField(blank=True, null=True)),
                ('current_period_start', models.DateTimeField(blank=True, null=True)),
                ('current_period_end', models.DateTimeField(blank=True, null=True)),
                ('cancel_at_period_end', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('studio', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='subscription', to='users.studio')),
            ],
            options={
                'verbose_name': 'Studio subscription',
                'verbose_name_plural': 'Studio subscriptions',
            },
        ),
    ]
