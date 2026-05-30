'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { deleteData, patchData, postData } from '@/lib/Api';
import { Checkbox } from '@/components/ui/checkbox';
import { gooeyToast as toast } from 'goey-toast';
import { Copy, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

type ApiKeyRow = {
  id: number;
  name: string;
  prefix: string;
  token: string;
  created_at: string;
  last_used_at: string | null;
};

type WebhookRow = {
  id: number;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
};

function eventLabel(event: string, labels: Record<string, string>, allEventsLabel: string) {
  if (event === '*') return allEventsLabel;
  return labels[event] || event;
}

function WebhookEventPicker({
  eventTypes,
  labels,
  selected,
  onChange,
  allEventsLabel,
}: {
  eventTypes: string[];
  labels: Record<string, string>;
  selected: string[];
  onChange: (events: string[]) => void;
  allEventsLabel: string;
}) {
  const allEvents = selected.includes('*');

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox
          checked={allEvents}
          onCheckedChange={(checked) => onChange(checked ? ['*'] : [])}
        />
        <span className="font-medium text-gray-900">{allEventsLabel}</span>
      </label>
      <div className="border-t border-stone-200 pt-2 space-y-2">
        {eventTypes.map((event) => {
          const checked = allEvents || selected.includes(event);
          return (
            <label
              key={event}
              className="flex items-center gap-2 text-sm cursor-pointer text-gray-700"
            >
              <Checkbox
                checked={checked}
                disabled={allEvents}
                onCheckedChange={(isChecked) => {
                  if (allEvents) return;
                  if (isChecked) {
                    onChange([...selected.filter((e) => e !== '*'), event]);
                  } else {
                    const next = selected.filter((e) => e !== event);
                    onChange(next.length ? next : ['*']);
                  }
                }}
              />
              <span>{eventLabel(event, labels, allEventsLabel)}</span>
              <span className="text-xs text-stone-400 font-mono">{event}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ApiPageContent() {
  const queryClient = useQueryClient();
  const { data: keys = [], isLoading: keysLoading, refetch: refetchKeys } = useFetch(
    'integrations/api-keys/'
  );
  const { data: webhooks = [], isLoading: hooksLoading, refetch: refetchHooks } = useFetch(
    'integrations/webhooks/'
  );
  const { data: eventTypesData } = useFetch('integrations/webhooks/event-types/');
  const { mutateAsync: createKey, isPending: creatingKey } = usePost();

  const [newKeyToken, setNewKeyToken] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['*']);
  const [creatingHook, setCreatingHook] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [editingHook, setEditingHook] = useState<WebhookRow | null>(null);
  const [editEvents, setEditEvents] = useState<string[]>(['*']);
  const [savingEvents, setSavingEvents] = useState(false);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  async function handleCreateKey() {
    try {
      const res = await createKey({
        url: 'integrations/api-keys/',
        data: { name: 'Zapier' },
      });
      if (res?.token) {
        setNewKeyToken(res.token);
        refetchKeys();
        queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      }
    } catch {
      toast.error(t('toasts.createKeyFailed'));
    }
  }

  async function handleRevokeKey(id: number) {
    try {
      await deleteData({ url: `integrations/api-keys/${id}/` });
      refetchKeys();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success(t('toasts.keyRevoked'));
    } catch {
      toast.error(t('toasts.revokeKeyFailed'));
    }
  }

  async function handleCreateWebhook() {
    const url = webhookUrl.trim();
    if (!url) {
      toast.error(t('toasts.webhookUrlRequired'));
      return;
    }
    const events =
      newWebhookEvents.includes('*') || newWebhookEvents.length === 0
        ? ['*']
        : newWebhookEvents;
    setCreatingHook(true);
    try {
      await postData({
        url: 'integrations/webhooks/',
        data: { url, events },
      });
      setWebhookUrl('');
      setNewWebhookEvents(['*']);
      refetchHooks();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success(t('toasts.webhookCreated'));
    } catch {
      toast.error(t('toasts.webhookCreateFailed'));
    } finally {
      setCreatingHook(false);
    }
  }

  async function handleTestWebhook(id: number) {
    setTestingId(id);
    try {
      const res = await postData({
        url: `integrations/webhooks/${id}/test/`,
        data: {},
      });
      if (res?.ok) {
        toast.success(t('toasts.testDelivered'));
      } else {
        toast.error(res?.error || t('toasts.webhookTestFailed'));
      }
    } catch {
      toast.error(t('toasts.webhookTestFailed'));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDeleteWebhook(id: number) {
    try {
      await deleteData({ url: `integrations/webhooks/${id}/` });
      refetchHooks();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success(t('toasts.webhookRemoved'));
    } catch {
      toast.error(t('toasts.webhookRemoveFailed'));
    }
  }

  function openEditEvents(hook: WebhookRow) {
    setEditingHook(hook);
    setEditEvents(hook.events?.length ? [...hook.events] : ['*']);
  }

  async function handleSaveEvents() {
    if (!editingHook) return;
    const events =
      editEvents.includes('*') || editEvents.length === 0 ? ['*'] : editEvents;
    setSavingEvents(true);
    try {
      await patchData({
        url: `integrations/webhooks/${editingHook.id}/`,
        data: { events },
      });
      refetchHooks();
      setEditingHook(null);
      toast.success(t('toasts.eventsUpdated'));
    } catch {
      toast.error(t('toasts.eventsUpdateFailed'));
    } finally {
      setSavingEvents(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(t('toasts.copied', { label })),
      () => toast.error(t('toasts.copyFailed'))
    );
  }

  const eventTypes: string[] = eventTypesData?.events ?? Object.keys(defaultEventLabels);
  const eventLabels: Record<string, string> = {
    ...defaultEventLabels,
    ...(eventTypesData?.labels ?? {}),
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          {t('description')}
        </p>
      </div>

      <Section
        title={t('restApiTitle')}
        description={t('restApiDescription')}
      >
        <code className="block text-xs bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 mb-2 break-all">
          {apiBase}/integrations/v1/
        </code>
        <ul className="text-xs text-stone-600 mb-4 list-disc pl-5 space-y-1">
          <li>
            <code>GET /integrations/v1/projects/</code> ·{' '}
            <code>POST /integrations/v1/projects/create/</code>
          </li>
          <li>
            <code>GET /integrations/v1/clients/</code> ·{' '}
            <code>POST /integrations/v1/clients/create/</code>
          </li>
        </ul>
        <div className="flex justify-end">
          <Button onClick={handleCreateKey} disabled={creatingKey}>
            {creatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creatingKey ? t('creating') : t('createApiKey')}
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.token')}</TableHead>
                <TableHead>{t('table.created')}</TableHead>
                <TableHead>{t('table.lastUsed')}</TableHead>
                <TableHead className="text-right">{t('table.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(keys as ApiKeyRow[]).map((k) => (
                <TableRow key={k.id}>
                  <TableCell>{k.name}</TableCell>
                  <TableCell className="font-mono text-xs">{k.token || `${k.prefix}…`}</TableCell>
                  <TableCell>{k.created_at?.slice(0, 10)}</TableCell>
                  <TableCell>
                    {k.last_used_at ? (
                      k.last_used_at.slice(0, 10)
                    ) : (
                      <Badge className="bg-stone-100 text-gray-900">{t('never')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRevokeKey(k.id)}>
                      {t('revoke')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!keysLoading && (keys as ApiKeyRow[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    {t('noApiKeys')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title={t('outboundWebhooksTitle')}
        description={t('outboundWebhooksDescription')}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">{t('endpointUrl')}</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>
          <div className="space-y-2">
            <Label>{t('eventsToSend')}</Label>
            <WebhookEventPicker
              eventTypes={eventTypes}
              labels={eventLabels}
              selected={newWebhookEvents}
              onChange={setNewWebhookEvents}
              allEventsLabel={allEventsLabel}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handleCreateWebhook} disabled={creatingHook}>
            {creatingHook && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('addWebhook')}
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.url')}</TableHead>
                <TableHead>{t('table.secret')}</TableHead>
                <TableHead>{t('table.events')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(webhooks as WebhookRow[]).map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="max-w-[200px] truncate text-xs">{h.url}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 font-mono text-xs"
                      onClick={() => copyText(h.secret, t('table.secret'))}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {t('copy')}
                    </Button>
                  </TableCell>
                  <TableCell className="text-xs max-w-[140px]">
                    {(h.events?.includes('*') ? ['*'] : h.events || ['*'])
                      .map((e) => eventLabel(e, eventLabels, allEventsLabel))
                      .join(', ')}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="sm" onClick={() => openEditEvents(h)}>
                      {t('eventsButton')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={testingId === h.id}
                      onClick={() => handleTestWebhook(h.id)}
                    >
                      {testingId === h.id ? t('sending') : t('test')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteWebhook(h.id)}>
                      {t('remove')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!hooksLoading && (webhooks as WebhookRow[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    {t('noWebhooks')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Dialog
        open={!!editingHook}
        onOpenChange={(open) => {
          if (!open) setEditingHook(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webhookEventsTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 truncate">{editingHook?.url}</p>
          <WebhookEventPicker
            eventTypes={eventTypes}
            labels={eventLabels}
            selected={editEvents}
            onChange={setEditEvents}
            allEventsLabel={allEventsLabel}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHook(null)}>
              {tc('cancel')}
            </Button>
            <Button onClick={handleSaveEvents} disabled={savingEvents}>
              {savingEvents && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tc('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!newKeyToken} onOpenChange={(open) => !open && setNewKeyToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('saveApiKeyTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-2">
            {t('saveApiKeyDescription')}
          </p>
          <code className="block text-xs break-all bg-stone-100 border rounded-lg p-3 font-mono">
            {newKeyToken}
          </code>
          <DialogFooter>
            <Button variant="outline" onClick={() => newKeyToken && copyText(newKeyToken, t('table.token'))}>
              <Copy className="h-4 w-4 mr-2" />
              {t('copyKey')}
            </Button>
            <Button onClick={() => setNewKeyToken(null)}>{t('done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApiPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <ApiPageContent />
    </PermissionGuard>
  );
}
