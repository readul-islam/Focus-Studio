from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('client_portal', '0002_alter_clientproject_client'),
        ('crm', '0006_client_is_active_client_last_login_client_password'),
        ('projects', '0031_procurement_catalog_product'),
        ('users', '0033_studio_stripe_connect'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientProjectMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('sender_type', models.CharField(choices=[('studio', 'Studio'), ('client', 'Client')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_messages', to='crm.client')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_messages', to='projects.project')),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_messages', to='users.studio')),
            ],
            options={
                'verbose_name': 'Client Project Message',
                'verbose_name_plural': 'Client Project Messages',
                'ordering': ['created_at'],
            },
        ),
    ]
