from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_studio_split_address_rename_city'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('manager', 'Manager'), ('member', 'Member')],
                default='member',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='rolepermission',
            name='permission',
            field=models.CharField(
                choices=[
                    ('projects.view', 'Projects \u2022 view'),
                    ('projects.edit', 'Projects \u2022 edit'),
                    ('tasks.view', 'Tasks \u2022 view'),
                    ('tasks.edit', 'Tasks \u2022 edit'),
                    ('finance.view', 'Finance \u2022 view'),
                    ('finance.edit', 'Finance \u2022 edit'),
                    ('clients.view', 'Clients \u2022 view'),
                    ('clients.edit', 'Clients \u2022 edit'),
                    ('library.view', 'Library \u2022 view'),
                    ('library.edit', 'Library \u2022 edit'),
                    ('procurement.view', 'Procurement \u2022 view'),
                    ('procurement.edit', 'Procurement \u2022 edit'),
                    ('documents.view', 'Documents \u2022 view'),
                    ('documents.edit', 'Documents \u2022 edit'),
                    ('reports.view', 'Reports \u2022 view'),
                    ('team.view', 'Team \u2022 view'),
                    ('team.edit', 'Team \u2022 edit'),
                    ('settings.edit', 'Settings \u2022 edit'),
                ],
                max_length=50,
            ),
        ),
    ]
