from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0016_expand_address_fields_and_additional_contacts'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('help_center', '0003_support_conversation'),
    ]

    operations = [
        migrations.AddField(
            model_name='supportconversation',
            name='portal',
            field=models.CharField(
                choices=[
                    ('studio', 'Studio app'),
                    ('client_portal', 'Client portal'),
                    ('contractor_portal', 'Contractor portal'),
                ],
                default='studio',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='supportconversation',
            name='portal_client',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='portal_support_conversations',
                to='crm.client',
            ),
        ),
        migrations.AlterField(
            model_name='supportconversation',
            name='user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='support_conversations',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name='supportconversation',
            index=models.Index(
                fields=['portal_client', 'portal', '-updated_at'],
                name='help_center_portal_cli_idx',
            ),
        ),
    ]
