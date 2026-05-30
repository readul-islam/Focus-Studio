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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('composeEmailDialog');
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
      toast.error(t('noRecipient'));
      return;
    }
    if (recipientKind === 'custom' && !isValidEmail(resolvedToEmail)) {
      toast.error(t('invalidEmail'));
      return;
    }
    if (!subjectLine) {
      toast.error(t('subjectRequired'));
      return;
    }
    if (!htmlHasContent(bodyHtml) && !files.length) {
      toast.error(t('messageRequired'));
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

      toast.success(t('sentSuccess'));
      onOpenChange(false);
      if (threadId) onSent?.(threadId);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('sendFailed')));
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        overlayClassName="bg-background/35 backdrop-blur-[8px]"
        className="sm:max-w-2xl bg-card border border-border/40 shadow-[0_20px_60px_rgba(0,0,0,0.65)] hover:border-primary/25 transition-colors duration-300 max-h-[92vh] flex flex-col overflow-hidden rounded-2xl text-foreground p-0 gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-card flex-shrink-0">
          <DialogTitle className="text-[16px] font-bold text-foreground tracking-tight">{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5 scrollbar-thin scrollbar-thumb-rounded pr-2 bg-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="compose-to-type" className="text-sm font-medium text-foreground/90">{t('to')}</Label>
              <Select
                value={recipientKind}
                onValueChange={(v) => handleRecipientKindChange(v as RecipientKind)}
              >
                <SelectTrigger 
                  id="compose-to-type"
                  className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] font-medium transition-colors hover:border-primary/40 focus:ring-0 focus:outline-none focus:border-primary/40"
                >
                  <SelectValue placeholder={t('recipientType')} />
                </SelectTrigger>
                <SelectContent className="bg-card z-[9999] rounded-xl border-border/80 shadow-2xl">
                  <SelectItem value="client" className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">{t('client')}</SelectItem>
                  <SelectItem value="team" className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">{t('teamMember')}</SelectItem>
                  <SelectItem value="custom" className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">{t('otherEmail')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="compose-subject" className="text-sm font-medium text-foreground/90">{t('subject')}</Label>
              <Input
                id="compose-subject"
                placeholder={t('subjectPlaceholder')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
            </div>
          </div>

          {recipientKind === 'client' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">{t('client')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3.5 h-3.5" />
                <Input
                  placeholder={t('searchClients')}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="h-10 pl-9 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-border/40 bg-background/50 rounded-xl p-1.5 scrollbar-thin scrollbar-thumb-rounded">
                {contactsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" />
                  </div>
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedClientId(contact.id)}
                      className={`text-left px-3 py-2 rounded-lg text-[13px] border transition-all ${
                        selectedClientId === contact.id
                          ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-muted/40 text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <span className="font-medium block">{contactLabel(contact)}</span>
                      <span
                        className={`text-xs block mt-0.5 ${
                          selectedClientId === contact.id
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {contact.email}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/80 text-center py-4 font-medium">
                    {t('noClientsWithEmail')}
                  </p>
                )}
              </div>
            </div>
          )}

          {recipientKind === 'team' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">{t('teamMember')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3.5 h-3.5" />
                <Input
                  placeholder={t('searchTeam')}
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="h-10 pl-9 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border border-border/40 bg-background/50 rounded-xl p-1.5 scrollbar-thin scrollbar-thumb-rounded">
                {teamLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" />
                  </div>
                ) : filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedUserId(member.id)}
                      className={`text-left px-3 py-2 rounded-lg text-[13px] border transition-all ${
                        selectedUserId === member.id
                          ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-muted/40 text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <span className="font-medium block">
                        {member.name || member.email}
                      </span>
                      {member.name && (
                        <span
                          className={`text-xs block mt-0.5 ${
                            selectedUserId === member.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {member.email}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/80 text-center py-4 font-medium">
                    {t('noTeamFound')}
                  </p>
                )}
              </div>
            </div>
          )}

          {recipientKind === 'custom' && (
            <div className="space-y-1.5">
              <Label htmlFor="compose-custom-email" className="text-sm font-medium text-foreground/90">{t('emailAddress')}</Label>
              <Input
                id="compose-custom-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">{t('linkProjectOptional')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3.5 h-3.5" />
              <Input
                placeholder={t('searchProjects')}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto border border-border/40 bg-background/50 rounded-xl p-1.5 scrollbar-thin scrollbar-thumb-rounded">
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className={`text-left px-3 py-2 rounded-lg text-[13px] border transition-all ${
                  selectedProjectId === null
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-muted/40 text-foreground/80 hover:text-foreground'
                }`}
              >
                {t('noProject')}
              </button>
              {projectsLoading ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/60" />
                </div>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`text-left px-3 py-2 rounded-lg text-[13px] border transition-all flex items-center justify-between gap-2 ${
                      selectedProjectId === project.id
                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-muted/40 text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    <span>{project.project_name}</span>
                    {project.project_code && (
                      <span
                        className={`text-xs shrink-0 ${
                          selectedProjectId === project.id
                            ? 'text-primary-foreground/75'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {project.project_code}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/80 text-center py-3 font-medium">{t('noProjectsFound')}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">{t('message')}</Label>
            <InboxReplyComposer
              replyBody={composeBody}
              setReplyBody={setComposeBody}
              onSend={handleSend}
              isSending={isSending}
              subject={subject}
              embedded
              placeholder={t('messagePlaceholder')}
              sendTitle={t('sendTitle')}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-card">
          <p className="text-xs text-muted-foreground text-left flex-1 truncate font-medium">
            {resolvedToEmail ? t('toPreview', { email: resolvedToEmail }) : t('selectRecipient')}
          </p>
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              disabled={isSending}
              className="h-10 px-5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
            >
              {t('cancel')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
