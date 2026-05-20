from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(
                choices=[
                    ('project_assigned', 'Assigned to Project'),
                    ('task_assigned', 'Assigned to Task'),
                    ('subtask_assigned', 'Assigned to Subtask'),
                    ('team_message', 'Team Message'),
                    ('comment_mention', 'Comment Mention'),
                ],
                max_length=50,
            ),
        ),
    ]
