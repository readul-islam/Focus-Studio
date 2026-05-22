from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0030_public_profile_and_portfolio'),
        ('task', '0001_initial'),
        ('users', '0029_user_cover_image'),
        ('notion', '0002_notionprojectmapping_notionprojectlink'),
    ]

    operations = [
        migrations.AddField(
            model_name='notiontoken',
            name='parent_page_id',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Notion page ID where new Focuspilot projects are created as child pages.',
                max_length=64,
            ),
        ),
        migrations.CreateModel(
            name='NotionProjectSync',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notion_project_page_id', models.CharField(max_length=64)),
                ('notion_tasks_database_id', models.CharField(blank=True, default='', max_length=64)),
                ('last_pushed_at', models.DateTimeField(blank=True, null=True)),
                ('last_error', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='notion_sync', to='projects.project')),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notion_project_syncs', to='users.studio')),
            ],
        ),
        migrations.CreateModel(
            name='NotionTaskLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notion_page_id', models.CharField(db_index=True, max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('studio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notion_task_links', to='users.studio')),
                ('task', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='notion_link', to='task.task')),
            ],
        ),
        migrations.AddConstraint(
            model_name='notiontasklink',
            constraint=models.UniqueConstraint(fields=('studio', 'notion_page_id'), name='unique_notion_task_page_per_studio'),
        ),
    ]
