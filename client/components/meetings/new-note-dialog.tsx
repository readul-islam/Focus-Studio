'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CreateMeetingPayload } from '@/lib/meetings';
import { buildMeetingUrl, extractMeetingId } from '@/lib/meeting-url';

type NoteMode = 'site_visit' | 'meeting_bot';

export function NewNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  defaultProjectId,
  lockProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    meeting: CreateMeetingPayload;
    transcriptText?: string;
    joinBot?: boolean;
  }) => Promise<void>;
  loading?: boolean;
  defaultProjectId?: number;
  lockProject?: boolean;
}) {
  const [mode, setMode] = React.useState<NoteMode>('site_visit');
  const [title, setTitle] = React.useState('');
  const [transcriptText, setTranscriptText] = React.useState('');
  const [meetingUrl, setMeetingUrl] = React.useState('');
  const [platform, setPlatform] = React.useState<'google_meet' | 'teams' | 'zoom'>('google_meet');
  const [projectId, setProjectId] = React.useState(defaultProjectId ? String(defaultProjectId) : '');

  React.useEffect(() => {
    if (open) {
      setTitle('');
      setTranscriptText('');
      setMeetingUrl('');
      setMode('site_visit');
      setProjectId(defaultProjectId ? String(defaultProjectId) : '');
    }
  }, [open, defaultProjectId]);

  async function handleSubmit() {
    if (!title.trim()) return;

    const base: CreateMeetingPayload = {
      title: title.trim(),
      platform,
      project: projectId ? Number(projectId) : defaultProjectId,
    };

    if (mode === 'site_visit') {
      await onSubmit({
        meeting: { ...base, capture_source: 'site_visit' },
        transcriptText: transcriptText.trim(),
      });
      return;
    }

    const meetingId = extractMeetingId(platform, meetingUrl.trim());
    await onSubmit({
      meeting: {
        ...base,
        capture_source: 'meeting_bot',
        meeting_url: meetingId ? buildMeetingUrl(platform, meetingId) : undefined,
        native_meeting_id: meetingId,
      },
      joinBot: Boolean(meetingId),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New AI note</DialogTitle>
          <DialogDescription>
            Paste a site visit transcript or send a bot to a live meeting. AI will extract summary, decisions, and action items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Site visit — Riverside ensuite"
            />
          </div>

          {!lockProject ? (
            <div className="space-y-2">
              <Label htmlFor="note-project">Project ID (optional)</Label>
              <Input
                id="note-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Link to a project for task conversion"
              />
            </div>
          ) : null}

          <Tabs value={mode} onValueChange={(v) => setMode(v as NoteMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="site_visit">Site visit / paste</TabsTrigger>
              <TabsTrigger value="meeting_bot">Live meeting</TabsTrigger>
            </TabsList>

            <TabsContent value="site_visit" className="space-y-2 pt-2">
              <Label htmlFor="transcript">Transcript or field notes</Label>
              <Textarea
                id="transcript"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                rows={8}
                placeholder="Paste notes from a site walk, voice memo transcript, or meeting notes…"
              />
            </TabsContent>

            <TabsContent value="meeting_bot" className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-url">Meeting URL or ID</Label>
                <Input
                  id="meeting-url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Requires VEXA_API_KEY in server/.env (API Keys tab at vexa.ai/account — not the transcription upload key).
                After the meeting, click Fetch transcript.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || (mode === 'site_visit' && !transcriptText.trim())}
            className="bg-neutral-900 text-white hover:bg-neutral-800"
          >
            {loading ? 'Processing…' : mode === 'site_visit' ? 'Generate AI note' : 'Create & join bot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
