from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, Studio
from .models import Meeting, MeetingActionItem, MeetingTranscript


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
        self.assertEqual(Meeting.objects.get().created_by, self.user)

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

    @patch('meetings.views.generate_summary_and_action_items')
    @patch('meetings.views.vexa.get_transcript')
    def test_fetch_transcript_success(self, mock_transcript, mock_ai):
        mock_transcript.return_value = [
            {'speaker': 'Alice', 'text': 'We need to fix the login bug.'},
            {'speaker': 'Bob', 'text': 'I will handle it by Friday.'},
        ]
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

    @patch('meetings.views.vexa.get_transcript', side_effect=Exception("Vexa down"))
    def test_fetch_transcript_vexa_error(self, mock_transcript):
        response = self.client.post(f'/meetings/meetings/{self.meeting.id}/fetch-transcript/')
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    @patch('meetings.views.generate_summary_and_action_items', side_effect=Exception("AI down"))
    @patch('meetings.views.vexa.get_transcript')
    def test_fetch_transcript_ai_failure_still_saves(self, mock_transcript, mock_ai):
        mock_transcript.return_value = [{'speaker': 'Alice', 'text': 'Hello'}]
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
