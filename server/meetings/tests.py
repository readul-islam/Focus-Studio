from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from projects.models import Project
from task.models import Task
from .models import Meeting, MeetingActionItem, MeetingTranscript
from . import vexa


def create_studio(name="Test Studio"):
    return Studio.objects.create(name=name)


def create_user(email="user@example.com", password="pass1234!", studio=None):
    user = User.objects.create_user(email=email, password=password)
    user.name = "Test User"
    user.studio = studio
    user.save()
    return user


def create_meeting(studio, user, title="Sprint Planning", platform="google_meet"):
    return Meeting.objects.create(
        title=title,
        platform=platform,
        native_meeting_id="meet.google.com/abc-def-ghi",
        studio=studio,
        created_by=user,
    )


class MeetingCRUDTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_meeting(self):
        data = {
            "title": "Kickoff",
            "platform": "zoom",
            "native_meeting_id": "zoom.us/j/123",
            "studio": self.studio.id,
        }
        response = self.client.post('/meetings/meetings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Meeting.objects.count(), 1)
        meeting = Meeting.objects.get()
        self.assertEqual(meeting.created_by, self.user)
        self.assertEqual(meeting.studio, self.studio)

    @patch('meetings.transcript.generate_summary_and_action_items')
    def test_create_then_process_text_same_studio(self, mock_ai):
        mock_ai.return_value = {
            'summary': 'Done',
            'decisions': [],
            'risks': [],
            'action_items': [],
        }
        create_resp = self.client.post(
            '/meetings/meetings/',
            {
                'title': 'Site visit',
                'platform': 'google_meet',
                'capture_source': 'site_visit',
            },
            format='json',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        meeting_id = create_resp.data['id']
        process_resp = self.client.post(
            f'/meetings/meetings/{meeting_id}/process-text/',
            {'transcript_text': 'Walked the site.'},
            format='json',
        )
        self.assertEqual(process_resp.status_code, status.HTTP_200_OK)

    def test_list_meetings(self):
        create_meeting(self.studio, self.user)
        create_meeting(self.studio, self.user, title="Retro")
        response = self.client.get('/meetings/meetings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_retrieve_meeting(self):
        meeting = create_meeting(self.studio, self.user)
        response = self.client.get(f'/meetings/meetings/{meeting.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], meeting.title)

    def test_update_meeting(self):
        meeting = create_meeting(self.studio, self.user)
        response = self.client.patch(f'/meetings/meetings/{meeting.id}/', {'title': 'Updated'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        meeting.refresh_from_db()
        self.assertEqual(meeting.title, 'Updated')

    def test_delete_meeting(self):
        meeting = create_meeting(self.studio, self.user)
        response = self.client.delete(f'/meetings/meetings/{meeting.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Meeting.objects.count(), 0)

    def test_list_meetings_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/meetings/meetings/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class VexaHelperTests(APITestCase):
    def test_normalize_google_meet_url(self):
        code = vexa.normalize_native_meeting_id(
            'google_meet',
            'https://meet.google.com/hzh-fjbs-umw',
        )
        self.assertEqual(code, 'hzh-fjbs-umw')

    def test_parse_vexa_segments_response(self):
        from .transcript import parse_vexa_transcript_payload

        segments, text = parse_vexa_transcript_payload({
            'segments': [
                {'speaker': 'Sagor Mahamud', 'text': 'Hey there. today we are talking about something important.'},
            ],
        })
        self.assertEqual(len(segments), 1)
        self.assertIn('Sagor Mahamud', text)
        self.assertIn('important', text)


class MeetingJoinBotTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.meeting = create_meeting(self.studio, self.user)

    def test_join_bot_already_in_meeting(self):
        self.meeting.bot_status = 'in_meeting'
        self.meeting.save()
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/join-bot/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('meetings.views.vexa.join_meeting')
    def test_join_bot_success(self, mock_join):
        mock_join.return_value = {'bot_id': 'bot-abc-123'}
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/join-bot/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.meeting.refresh_from_db()
        self.assertEqual(self.meeting.bot_id, 'bot-abc-123')
        self.assertEqual(self.meeting.bot_status, 'joining')

    @patch('meetings.views.vexa.join_meeting', side_effect=Exception("Vexa unreachable"))
    def test_join_bot_vexa_error(self, mock_join):
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/join-bot/')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    def test_join_bot_meeting_not_found(self):
        response = self.client.post('/meetings/meetings/9999/join-bot/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MeetingStopBotTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.meeting = create_meeting(self.studio, self.user)

    def test_stop_bot_no_bot_id(self):
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/stop-bot/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('meetings.views.vexa.stop_bot')
    def test_stop_bot_success(self, mock_stop):
        self.meeting.bot_id = 'bot-abc-123'
        self.meeting.bot_status = 'in_meeting'
        self.meeting.save()

        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/stop-bot/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.meeting.refresh_from_db()
        self.assertEqual(self.meeting.bot_status, 'completed')

    @patch('meetings.views.vexa.stop_bot', side_effect=Exception("Vexa error"))
    def test_stop_bot_vexa_error(self, mock_stop):
        self.meeting.bot_id = 'bot-xyz'
        self.meeting.save()
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/stop-bot/')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)


class MeetingFetchTranscriptTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.meeting = create_meeting(self.studio, self.user)

    @patch('meetings.transcript.generate_summary_and_action_items')
    @patch('meetings.transcript.vexa.get_transcript')
    def test_fetch_transcript_success(self, mock_transcript, mock_ai):
        mock_transcript.return_value = {
            'platform': 'google_meet',
            'native_meeting_id': 'meet.google.com/abc-def-ghi',
            'segments': [
                {'speaker': 'Alice', 'text': 'We need to fix the login bug.'},
                {'speaker': 'Bob', 'text': 'I will handle it by Friday.'},
            ],
        }
        mock_ai.return_value = {
            'summary': 'Alice raised a login bug; Bob will fix it by Friday.',
            'action_items': [
                {'title': 'Fix login bug', 'description': 'Bob to fix by Friday'},
            ],
        }

        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/fetch-transcript/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(MeetingTranscript.objects.filter(meeting=self.meeting).exists())
        self.assertEqual(MeetingActionItem.objects.filter(meeting=self.meeting).count(), 1)
        self.meeting.refresh_from_db()
        self.assertEqual(self.meeting.bot_status, 'completed')

    @patch('meetings.transcript.vexa.get_transcript', side_effect=Exception("Vexa down"))
    def test_fetch_transcript_vexa_error(self, mock_transcript):
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/fetch-transcript/')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    @patch('meetings.transcript.generate_summary_and_action_items', side_effect=Exception("AI down"))
    @patch('meetings.transcript.vexa.get_transcript')
    def test_fetch_transcript_ai_failure_still_saves(self, mock_transcript, mock_ai):
        mock_transcript.return_value = {
            'segments': [{'speaker': 'Alice', 'text': 'Hello'}],
        }
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/fetch-transcript/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transcript = MeetingTranscript.objects.get(meeting=self.meeting)
        self.assertIn('[AI summary failed', transcript.summary)


class MeetingActionItemTests(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.client.force_authenticate(user=self.user)
        self.meeting = create_meeting(self.studio, self.user)
        self.action_item = MeetingActionItem.objects.create(
            meeting=self.meeting,
            title="Write tests",
            description="Cover all endpoints",
        )

    def test_update_action_item_success(self):
        url = f'/meetings/meetings/{self.meeting.id}/action-items/{self.action_item.id}/'
        response = self.client.patch(url, {'status': 'done'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.action_item.refresh_from_db()
        self.assertEqual(self.action_item.status, 'done')

    def test_update_action_item_not_found(self):
        url = f'/meetings/meetings/{self.meeting.id}/action-items/9999/'
        response = self.client.patch(url, {'status': 'done'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class NoteTakerFlowTests(APITestCase):
    """End-to-end note-taker flow: site visit paste → AI → publish → convert task."""

    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(studio=self.studio)
        self.project = Project.objects.create(
            project_name='Riverside Loft',
            studio=self.studio,
            created_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

    @patch('meetings.transcript.generate_summary_and_action_items')
    def test_site_visit_process_publish_convert(self, mock_ai):
        mock_ai.return_value = {
            'summary': 'Client approved tile selection for ensuite.',
            'decisions': ['Use Calacatta marble in ensuite'],
            'risks': ['Lead time on marble may slip install'],
            'action_items': [
                {'title': 'Order marble samples', 'description': 'Send to client by Friday'},
            ],
        }

        create_resp = self.client.post(
            '/meetings/meetings/',
            {
                'title': 'Site visit — Riverside',
                'platform': 'google_meet',
                'capture_source': 'site_visit',
                'project': self.project.id,
                'studio': self.studio.id,
            },
            format='json',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        meeting_id = create_resp.data['id']

        process_resp = self.client.post(
            f'/meetings/meetings/{meeting_id}/process-text/',
            {'transcript_text': 'On site we walked the ensuite and agreed on marble.'},
            format='json',
        )
        self.assertEqual(process_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(process_resp.data['note_status'], 'needs_review')
        transcript = MeetingTranscript.objects.get(meeting_id=meeting_id)
        self.assertEqual(transcript.summary, 'Client approved tile selection for ensuite.')
        self.assertEqual(len(transcript.decisions), 1)
        action_item = MeetingActionItem.objects.get(meeting_id=meeting_id)

        publish_resp = self.client.post(f'/meetings/meetings/{meeting_id}/publish/')
        self.assertEqual(publish_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(publish_resp.data['note_status'], 'published')

        convert_resp = self.client.post(
            f'/meetings/meetings/{meeting_id}/action-items/{action_item.id}/convert-to-task/',
        )
        self.assertEqual(convert_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(Task.objects.filter(project=self.project, title='Order marble samples').exists())
        action_item.refresh_from_db()
        self.assertIsNotNone(action_item.converted_task_id)

    def test_list_meetings_by_project(self):
        Meeting.objects.create(
            title='Project note',
            platform='google_meet',
            studio=self.studio,
            project=self.project,
            created_by=self.user,
            capture_source='site_visit',
        )
        Meeting.objects.create(
            title='Other note',
            platform='google_meet',
            studio=self.studio,
            created_by=self.user,
            capture_source='site_visit',
        )
        response = self.client.get(f'/meetings/meetings/?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [m['title'] for m in response.data]
        self.assertEqual(titles, ['Project note'])

    def test_convert_without_project_fails(self):
        meeting = Meeting.objects.create(
            title='Unlinked',
            platform='google_meet',
            studio=self.studio,
            created_by=self.user,
        )
        item = MeetingActionItem.objects.create(meeting=meeting, title='Follow up')
        response = self.client.post(
            f'/meetings/meetings/{meeting.id}/action-items/{item.id}/convert-to-task/',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
