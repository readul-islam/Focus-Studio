import { fetchData, patchData, postData } from '@/lib/Api';
import type { Note, NoteActionItem, NoteSource } from '@/components/notes-types';

export interface MeetingActionItemDto {
  id: number;
  title: string;
  description: string;
  status: string;
  converted_task_id: number | null;
  assignee_name?: string | null;
}

export interface MeetingTranscriptDto {
  transcript_text: string;
  summary: string;
  decisions: string[];
  risks: string[];
}

export interface MeetingDto {
  id: number;
  title: string;
  platform: string;
  capture_source: 'meeting_bot' | 'site_visit' | 'upload';
  note_status: 'needs_review' | 'published';
  project: number | null;
  meeting_url?: string;
  native_meeting_id?: string;
  bot_status: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  transcript?: MeetingTranscriptDto | null;
  action_items?: MeetingActionItemDto[];
}

export interface CreateMeetingPayload {
  title: string;
  platform?: 'google_meet' | 'teams' | 'zoom';
  capture_source?: 'meeting_bot' | 'site_visit' | 'upload';
  project?: number;
  studio?: number;
  native_meeting_id?: string;
  meeting_url?: string;
}

function captureSourceToNoteSource(capture: MeetingDto['capture_source'], platform: string): NoteSource {
  if (capture === 'site_visit') return 'mobile';
  if (capture === 'upload') return 'upload';
  if (platform === 'zoom') return 'zoom';
  return 'zoom';
}

export function meetingToNote(meeting: MeetingDto): Note {
  const transcript = meeting.transcript;
  const actionItems: NoteActionItem[] = (meeting.action_items ?? []).map((item) => ({
    id: String(item.id),
    title: item.title,
    description: item.description,
    convertedTaskId: item.converted_task_id,
  }));

  return {
    id: String(meeting.id),
    title: meeting.title,
    summary: transcript?.summary ?? '',
    transcriptText: transcript?.transcript_text ?? '',
    source: captureSourceToNoteSource(meeting.capture_source, meeting.platform),
    status: meeting.note_status,
    visibility: meeting.project ? 'project' : 'studio',
    projectId: meeting.project ? String(meeting.project) : '',
    linked: [],
    updatedAt: meeting.updated_at,
    author: {
      id: '',
      name: meeting.created_by_name ?? 'Studio',
    },
    ai: {
      decisions: transcript?.decisions ?? [],
      actions: actionItems.map((a) => a.title),
      risks: transcript?.risks ?? [],
    },
    actionItems,
    attachments: [],
    meetingId: meeting.id,
    botStatus: meeting.bot_status,
    meetingUrl: meeting.meeting_url,
    nativeMeetingId: meeting.native_meeting_id,
    platform: meeting.platform,
  };
}

export async function listMeetings(projectId?: string): Promise<MeetingDto[]> {
  const qs = projectId ? `?project_id=${projectId}` : '';
  const data = await fetchData(`meetings/meetings/${qs}`);
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<MeetingDto> {
  return postData({ url: 'meetings/meetings/', data: payload });
}

export async function processMeetingText(meetingId: number, transcriptText: string): Promise<MeetingDto> {
  return postData({
    url: `meetings/meetings/${meetingId}/process-text/`,
    data: { transcript_text: transcriptText },
  });
}

export async function publishMeeting(meetingId: number): Promise<MeetingDto> {
  return postData({ url: `meetings/meetings/${meetingId}/publish/` });
}

export async function joinMeetingBot(meetingId: number): Promise<MeetingDto> {
  return postData({ url: `meetings/meetings/${meetingId}/join-bot/` });
}

export async function fetchMeetingTranscript(meetingId: number): Promise<MeetingDto> {
  return postData({ url: `meetings/meetings/${meetingId}/fetch-transcript/` });
}

export async function convertActionItemToTask(meetingId: number, actionItemId: number) {
  return postData({
    url: `meetings/meetings/${meetingId}/action-items/${actionItemId}/convert-to-task/`,
  });
}

export async function updateMeeting(meetingId: number, data: Partial<CreateMeetingPayload>) {
  return patchData({ url: `meetings/meetings/${meetingId}/`, data });
}
