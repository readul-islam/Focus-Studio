from unittest.mock import MagicMock, patch

from django.test import TestCase

from notion.outbound import (
    build_task_page_properties,
    map_task_priority_to_notion,
    map_task_status_to_notion,
    normalize_notion_page_id,
    push_project_to_notion,
    upsert_project_sync_from_link,
)
from notion.sync import map_notion_status_to_project_status
from notion.utils import extract_page_title


class NotionSyncHelpersTest(TestCase):
    def test_status_mapping(self):
        self.assertEqual(map_notion_status_to_project_status('Done'), 'COM')
        self.assertEqual(map_notion_status_to_project_status('In progress'), 'AC')

    def test_extract_title(self):
        page = {
            'properties': {
                'Task name': {
                    'type': 'title',
                    'title': [{'plain_text': 'Kitchen remodel'}],
                }
            }
        }
        self.assertEqual(extract_page_title(page, 'Task name'), 'Kitchen remodel')


class NotionOutboundHelpersTest(TestCase):
    def test_task_status_to_notion(self):
        self.assertEqual(map_task_status_to_notion('TD'), 'Not started')
        self.assertEqual(map_task_status_to_notion('IP'), 'In progress')
        self.assertEqual(map_task_status_to_notion('D'), 'Done')

    def test_task_priority_to_notion(self):
        self.assertEqual(map_task_priority_to_notion('H'), 'High')
        self.assertEqual(map_task_priority_to_notion('L'), 'Low')

    def test_normalize_page_id_from_url(self):
        url = 'https://www.notion.so/myworkspace/Page-Title-abc123def4567890abcdef1234567890'
        result = normalize_notion_page_id(url)
        self.assertTrue('-' in result or len(result) >= 32)

    def test_build_task_properties_keys(self):
        task = MagicMock()
        task.title = 'Quarterly sales'
        task.description = 'Plan Q2'
        task.status = 'IP'
        task.priority = 'M'
        task.start_date = None
        task.end_date = None
        task.phase = None
        task.assignees.all.return_value = []

        task.attachments.all.return_value = []

        props = build_task_page_properties(task)
        self.assertIn('Task Name', props)
        self.assertIn('Status', props)
        self.assertIn('Attachments', props)
        self.assertEqual(props['Status']['status']['name'], 'In progress')


class NotionOutboundPushTest(TestCase):
    @patch('notion.outbound.create_notion_project_page')
    @patch('notion.outbound._find_or_create_parent_page')
    @patch('notion.outbound.get_studio_notion_token')
    def test_push_project_creates_sync(
        self, mock_token, mock_parent, mock_create_page
    ):
        from projects.models import Project
        from users.models import Studio, User

        studio = Studio.objects.create(name='Test Studio', notion=True)
        user = User.objects.create_user(email='owner@test.com', password='pass1234!')
        user.studio = studio
        user.save()
        project = Project.objects.create(
            studio=studio,
            project_name='Vivid Studio',
            created_by=user,
        )

        token = MagicMock()
        token.access_token = 'secret'
        token.parent_page_id = 'parent-uuid'
        mock_token.return_value = token
        mock_parent.return_value = ('parent-uuid', None)
        mock_create_page.return_value = (
            {'id': 'page-uuid-1234', 'url': 'https://notion.so/page'},
            None,
        )

        push_project_to_notion(project, user)

        from notion.models import NotionProjectSync

        sync = NotionProjectSync.objects.get(project=project)
        self.assertEqual(sync.notion_project_page_id, 'page-uuid-1234')

    def test_upsert_from_inbound_link(self):
        from projects.models import Project
        from users.models import Studio, User
        from notion.models import NotionProjectSync

        studio = Studio.objects.create(name='Studio B', notion=True)
        user = User.objects.create_user(email='b@test.com', password='pass1234!')
        user.studio = studio
        user.save()
        project = Project.objects.create(studio=studio, project_name='Inbound', created_by=user)

        upsert_project_sync_from_link(studio, project, 'inbound-page-id')

        sync = NotionProjectSync.objects.get(project=project)
        self.assertEqual(sync.notion_project_page_id, 'inbound-page-id')
