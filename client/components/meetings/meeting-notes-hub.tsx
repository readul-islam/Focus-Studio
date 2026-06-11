'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { NotesFeed } from '@/components/notes-feed';
import { NotesSidePanel } from '@/components/notes-side-panel';
import { NewNoteDialog } from '@/components/meetings/new-note-dialog';
import type { Note } from '@/components/notes-types';
import {
  convertActionItemToTask,
  createMeeting,
  fetchMeetingTranscript,
  joinMeetingBot,
  listMeetings,
  meetingToNote,
  processMeetingText,
  publishMeeting,
} from '@/lib/meetings';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function MeetingNotesHub({
  projectId,
  compact = false,
  className,
}: {
  projectId?: string;
  compact?: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const queryKey = ['meetings', projectId ?? 'all'];

  const { data: meetings = [], isLoading, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () => listMeetings(projectId),
  });

  const notes = React.useMemo(() => meetings.map(meetingToNote), [meetings]);

  const [sideOpen, setSideOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [busyActionItemId, setBusyActionItemId] = React.useState<string | null>(null);
  const [fetchingTranscript, setFetchingTranscript] = React.useState(false);

  const needsTranscript =
    selectedNote?.meetingId &&
    meetings.find((m) => m.id === selectedNote.meetingId)?.capture_source === 'meeting_bot' &&
    !selectedNote.transcriptText?.trim();

  async function handleFetchTranscript(meetingId: number) {
    setFetchingTranscript(true);
    try {
      const updated = await fetchMeetingTranscript(meetingId);
      toast.success('Transcript fetched — review AI summary');
      await refresh();
      setSelectedNote(meetingToNote(updated));
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Could not fetch transcript from Vexa';
      toast.error(msg);
    } finally {
      setFetchingTranscript(false);
    }
  }

  function openNote(n: Note) {
    setSelectedNote(n);
    setSideOpen(true);
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey });
  }

  async function handleApprove(note: Note) {
    if (!note.meetingId) return;
    try {
      const updated = await publishMeeting(note.meetingId);
      toast.success('Note published');
      await refresh();
      setSelectedNote(meetingToNote(updated));
    } catch {
      toast.error('Could not publish note');
    }
  }

  async function handleConvertFirstAction(note: Note) {
    const first = note.actionItems?.find((a) => !a.convertedTaskId);
    if (!first) {
      toast.info('No action items to convert');
      openNote(note);
      return;
    }
    await handleConvertActionItem(note, first.id);
  }

  async function handleConvertActionItem(note: Note, actionItemId: string) {
    if (!note.meetingId) return;
    if (!note.projectId) {
      toast.error('Link this note to a project before converting to tasks');
      return;
    }
    setBusyActionItemId(actionItemId);
    try {
      const result = await convertActionItemToTask(note.meetingId, Number(actionItemId));
      toast.success(`Task created: ${result.title ?? 'Action item'}`);
      await refresh();
      if (result.meeting) {
        setSelectedNote(meetingToNote(result.meeting));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Could not convert to task';
      toast.error(msg);
    } finally {
      setBusyActionItemId(null);
    }
  }

  async function handleCreate(payload: {
    meeting: Parameters<typeof createMeeting>[0];
    transcriptText?: string;
    joinBot?: boolean;
  }) {
    setSubmitting(true);
    try {
      let meeting = await createMeeting(payload.meeting);

      if (payload.transcriptText) {
        meeting = await processMeetingText(meeting.id, payload.transcriptText);
        toast.success('AI note generated — review and approve when ready');
      } else if (payload.joinBot) {
        try {
          meeting = await joinMeetingBot(meeting.id);
          toast.success('Bot joining meeting');
        } catch (joinErr: any) {
          const vexaMsg =
            joinErr?.response?.data?.error ??
            'Set VEXA_API_KEY and VEXA_API_BASE=https://api.cloud.vexa.ai in server/.env, then restart the API.';
          toast.info('Meeting created — bot could not join', { description: vexaMsg });
        }
      } else {
        toast.success('Meeting note created');
      }

      setDialogOpen(false);
      await refresh();
      openNote(meetingToNote(meeting));
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        err?.message ??
        'Could not create note';
      toast.error(typeof msg === 'string' ? msg : 'Could not create note');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedMeeting = selectedNote?.meetingId
    ? meetings.find((m) => m.id === selectedNote.meetingId)
    : undefined;

  return (
    <div className={className}>
      {!compact ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">AI Note-taker</h1>
            <p className="text-sm text-neutral-600">
              Transcribe meetings and site visits into searchable notes, decisions, and action items.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {needsTranscript && selectedNote?.meetingId ? (
              <Button
                size="sm"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
                disabled={fetchingTranscript}
                onClick={() => handleFetchTranscript(selectedNote.meetingId!)}
              >
                {fetchingTranscript ? 'Fetching…' : 'Fetch transcript'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Loading notes…
        </div>
      ) : (
        <NotesFeed
          notes={notes}
          onOpen={openNote}
          onApprove={handleApprove}
          onConvertTask={handleConvertFirstAction}
          onNewNote={() => setDialogOpen(true)}
          className={compact ? className : undefined}
          emptyDescription={
            projectId
              ? 'Add a site visit transcript or meeting for this project.'
              : 'Record a site visit or paste a meeting transcript to generate AI notes.'
          }
        />
      )}

      <NotesSidePanel
        open={sideOpen}
        onOpenChange={setSideOpen}
        note={selectedNote}
        onApprove={handleApprove}
        onConvertActionItem={handleConvertActionItem}
        busyActionItemId={busyActionItemId}
        onFetchTranscript={
          needsTranscript && selectedNote?.meetingId
            ? () => handleFetchTranscript(selectedNote.meetingId!)
            : undefined
        }
        fetchingTranscript={fetchingTranscript}
      />

      <NewNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        loading={submitting}
        defaultProjectId={projectId ? Number(projectId) : undefined}
        lockProject={Boolean(projectId)}
      />
    </div>
  );
}
