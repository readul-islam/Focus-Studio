from django.test import TestCase

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
