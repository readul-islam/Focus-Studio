'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { postData, postFormData } from '@/lib/Api';
import { getApiErrorMessage } from '@/lib/api-error';
import { gooeyToast as toast } from 'goey-toast';
import { InboxReplyComposer } from '@/components/inbox/InboxReplyComposer';
import { htmlHasContent } from '@/lib/html-content';
import { sanitizeComposeHtml } from '@/lib/sanitize-html';

type RecipientKind = 'client' | 'team' | 'custom';

type StudioContact = {
  id: number;
  email?: string | null;
  name?: string | null;
  surname?: string | null;
  company_name?: string | null;
};

type StudioUser = {
  id: number;
  email: string;
  name?: string | null;
};

type ProjectRow = {
  id: number;
  project_name: string;
  project_code?: string | null;
  client?: { id: number } | null;
};

type ComposeEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studioId?: number | string | null;
  currentUserEmail?: string | null;
  onSent?: (threadId: string) => void;
};

function contactLabel(contact: StudioContact): string {
  const name =
    [contact.name, contact.surname].filter(Boolean).join(' ') ||
    contact.company_name ||
    `Contact #${contact.id}`;
  if (contact.company_name && contact.company_name !== name) {
    return `${name} — ${contact.company_name}`;
  }
  return name;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  studioId,
  currentUserEmail,
  onSent,
}: ComposeEmailDialogProps) {
  const [recipientKind, setRecipientKind] = useState<RecipientKind>('client');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  const contactsEndpoint = open
    ? `crm/studio-contacts/?contact_type=CL&page_size=100${
        clientSearch.trim() ? `&search=${encodeURIComponent(clientSearch.trim())}` : ''
      }`
    : null;

  const { data: contactsData, isLoading: contactsLoading } = useFetch(contactsEndpoint);
  const contacts: StudioContact[] = useMemo(() => {
    const raw = (contactsData as { results?: StudioContact[] })?.results ?? contactsData;
    return Array.isArray(raw) ? raw.filter((c) => c.email?.trim()) : [];
  }, [contactsData]);

  const teamEndpoint =
    open && studioId ? `user/studio-users/?studio_id=${studioId}` : null;
  const { data: teamData, isLoading: teamLoading } = useFetch(teamEndpoint);
  const teamMembers: StudioUser[] = useMemo(() => {
    const list = Array.isArray(teamData) ? teamData : [];
    const self = currentUserEmail?.toLowerCase();
    return list.filter(
      (u) => u.email?.trim() && u.email.toLowerCase() !== self
    );
  }, [teamData, currentUserEmail]);

  const { data: projectsData, isLoading: projectsLoading } = useFetch(
    open ? 'projects/user-projects/' : null
  );
  const projects: ProjectRow[] = useMemo(() => {
    const raw = projectsData as ProjectRow[] | { results?: ProjectRow[] };
    if (Array.isArray(raw)) return raw;
    return raw?.results ?? [];
  }, [projectsData]);

  const filteredTeam = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return teamMembers;
    return teamMembers.filter((u) => {
      const label = [u.name, u.email].filter(Boolean).join(' ').toLowerCase();
      return label.includes(q);
    });
  }, [teamMembers, teamSearch]);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (recipientKind === 'client' && selectedClientId) {
      list = list.filter((p) => p.client?.id === selectedClientId);
    }
    const q = projectSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const hay = `${p.project_name} ${p.project_code ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, recipientKind, selectedClientId, projectSearch]);

  const resolvedToEmail = useMemo(() => {
    if (recipientKind === 'client' && selectedClientId) {
      return contacts.find((c) => c.id === selectedClientId)?.email?.trim() ?? '';
    }
    if (recipientKind === 'team' && selectedUserId) {
      return teamMembers.find((u) => u.id === selectedUserId)?.email?.trim() ?? '';
    }
    if (recipientKind === 'custom') {
      return customEmail.trim();
    }
    return '';
  }, [
    recipientKind,
    selectedClientId,
    selectedUserId,
    customEmail,
    contacts,
    teamMembers,
  ]);

  const resetForm = () => {
    setRecipientKind('client');
    setSelectedClientId(null);
    setSelectedUserId(null);
    setCustomEmail('');
    setSubject('');
    setSelectedProjectId(null);
    setComposeBody('');
    setClientSearch('');
    setTeamSearch('');
    setProjectSearch('');
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  useEffect(() => {
    setSelectedProjectId(null);
  }, [recipientKind, selectedClientId]);

  const handleRecipientKindChange = (value: RecipientKind) => {
    setRecipientKind(value);
    setSelectedClientId(null);
    setSelectedUserId(null);
    setCustomEmail('');
  };

  const handleSend = async (files: File[]) => {
    const bodyHtml = sanitizeComposeHtml(composeBody);
    const subjectLine = subject.trim();

    if (!resolvedToEmail) {
      toast.error('Choose a recipient or enter an email address.');
      return;
    }
    if (recipientKind === 'custom' && !isValidEmail(resolvedToEmail)) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (!subjectLine) {
      toast.error('Subject is required.');
      return;
    }
    if (!htmlHasContent(bodyHtml) && !files.length) {
      toast.error('Write a message or attach a file.');
      return;
    }

    const formData = new FormData();
    formData.append('to_email', resolvedToEmail);
    formData.append('subject', subjectLine);
    formData.append('body', bodyHtml);
    files.forEach((file) => formData.append('attachments', file));

    setIsSending(true);
    try {
      const res = (await postFormData({
        url: 'gmail/send/',
        data: formData,
      })) as { thread_id?: string; message_id?: string; error?: string };

      if (res?.error) {
        throw new Error(res.error);
      }

      const threadId = res?.thread_id?.trim();
      if (selectedProjectId && threadId) {
        await postData({
          url: 'gmail/threads/link/',
          data: {
            thread_id: threadId,
            project_ids: [selectedProjectId],
          },
        });
      }

      toast.success('Email sent');
      onOpenChange(false);
      if (threadId) onSent?.(threadId);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to send email'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>New email</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-1 pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="compose-to-type">To</Label>
              <Select
                value={recipientKind}
                onValueChange={(v) => handleRecipientKindChange(v as RecipientKind)}
              >
                <SelectTrigger id="compose-to-type">
                  <SelectValue placeholder="Recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="team">Team member</SelectItem>
                  <SelectItem value="custom">Other email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compose-subject">Subject</Label>
              <Input
                id="compose-subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {recipientKind === 'client' && (
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-1">
                {contactsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedClientId(contact.id)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedClientId === contact.id
                          ? 'bg-black text-white'
                          : 'hover:bg-stone-50 text-gray-800'
                      }`}
                    >
                      <span className="font-medium block">{contactLabel(contact)}</span>
                      <span
                        className={`text-xs ${
                          selectedClientId === contact.id
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {contact.email}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No clients with an email address found
                  </p>
                )}
              </div>
            </div>
          )}

          {recipientKind === 'team' && (
            <div className="space-y-2">
              <Label>Team member</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search team..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-1">
                {teamLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedUserId(member.id)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedUserId === member.id
                          ? 'bg-black text-white'
                          : 'hover:bg-stone-50 text-gray-800'
                      }`}
                    >
                      <span className="font-medium block">
                        {member.name || member.email}
                      </span>
                      {member.name && (
                        <span
                          className={`text-xs ${
                            selectedUserId === member.id
                              ? 'text-gray-300'
                              : 'text-gray-500'
                          }`}
                        >
                          {member.email}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No team members found
                  </p>
                )}
              </div>
            </div>
          )}

          {recipientKind === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="compose-custom-email">Email address</Label>
              <Input
                id="compose-custom-email"
                type="email"
                placeholder="name@example.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="bg-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Link to project (optional)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className={`text-left px-3 py-2 rounded-md text-sm ${
                  selectedProjectId === null
                    ? 'bg-stone-100 text-gray-800 font-medium'
                    : 'hover:bg-stone-50 text-gray-600'
                }`}
              >
                No project
              </button>
              {projectsLoading ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 ${
                      selectedProjectId === project.id
                        ? 'bg-black text-white'
                        : 'hover:bg-stone-50 text-gray-800'
                    }`}
                  >
                    <span>{project.project_name}</span>
                    {project.project_code && (
                      <span
                        className={`text-xs shrink-0 ${
                          selectedProjectId === project.id
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {project.project_code}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-3">No projects found</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <InboxReplyComposer
              replyBody={composeBody}
              setReplyBody={setComposeBody}
              onSend={handleSend}
              isSending={isSending}
              subject={subject}
              embedded
              placeholder="Write your message..."
              sendTitle="Send email"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 pt-4 sm:justify-between gap-2">
          <p className="text-xs text-gray-500 text-left flex-1 truncate">
            {resolvedToEmail ? `To: ${resolvedToEmail}` : 'Select a recipient'}
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
