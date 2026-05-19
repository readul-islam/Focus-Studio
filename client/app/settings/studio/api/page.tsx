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
import { deleteData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { Copy, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

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
  const [creatingHook, setCreatingHook] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

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
      toast.error('Could not create API key.');
    }
  }

  async function handleRevokeKey(id: number) {
    try {
      await deleteData({ url: `integrations/api-keys/${id}/` });
      refetchKeys();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success('API key revoked.');
    } catch {
      toast.error('Could not revoke API key.');
    }
  }

  async function handleCreateWebhook() {
    const url = webhookUrl.trim();
    if (!url) {
      toast.error('Enter a webhook URL.');
      return;
    }
    setCreatingHook(true);
    try {
      await postData({
        url: 'integrations/webhooks/',
        data: { url, events: ['*'] },
      });
      setWebhookUrl('');
      refetchHooks();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success('Webhook created. Copy the signing secret from the list.');
    } catch {
      toast.error('Could not create webhook.');
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
        toast.success('Test event delivered.');
      } else {
        toast.error(res?.error || 'Webhook test failed.');
      }
    } catch {
      toast.error('Webhook test failed.');
    } finally {
      setTestingId(null);
    }
  }

  async function handleDeleteWebhook(id: number) {
    try {
      await deleteData({ url: `integrations/webhooks/${id}/` });
      refetchHooks();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      toast.success('Webhook removed.');
    } catch {
      toast.error('Could not remove webhook.');
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied.`),
      () => toast.error('Copy failed.')
    );
  }

  const eventTypes: string[] = eventTypesData?.events ?? [];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">API & webhooks</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Connect Zapier or custom automations with studio API keys and signed webhooks.
        </p>
      </div>

      <Section
        title="Zapier / REST API"
        description="Use Bearer auth with your API key. Base URL for automation triggers:"
      >
        <code className="block text-xs bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 mb-4 break-all">
          {apiBase}/integrations/v1/
        </code>
        <div className="flex justify-end">
          <Button onClick={handleCreateKey} disabled={creatingKey}>
            {creatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creatingKey ? 'Creating...' : 'Create API key'}
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                      <Badge className="bg-stone-100 text-gray-900">Never</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRevokeKey(k.id)}>
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!keysLoading && (keys as ApiKeyRow[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    No API keys yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="Outbound webhooks"
        description="Focuspilot signs payloads with HMAC-SHA256 in X-Focuspilot-Signature."
      >
        {eventTypes.length > 0 ? (
          <p className="text-xs text-stone-500 mb-3">
            Events: {eventTypes.join(', ')}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Endpoint URL</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handleCreateWebhook} disabled={creatingHook}>
            {creatingHook && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add webhook
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Secret</TableHead>
                <TableHead>Events</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      onClick={() => copyText(h.secret, 'Secret')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </TableCell>
                  <TableCell className="text-xs">{h.events?.join(', ') || '*'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={testingId === h.id}
                      onClick={() => handleTestWebhook(h.id)}
                    >
                      {testingId === h.id ? 'Sending...' : 'Test'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteWebhook(h.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!hooksLoading && (webhooks as WebhookRow[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    No webhooks yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Dialog open={!!newKeyToken} onOpenChange={(open) => !open && setNewKeyToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your API key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-2">
            Copy this key now. It will not be shown again. Use it as{' '}
            <code className="text-xs bg-stone-100 px-1">Authorization: Bearer &lt;key&gt;</code> in
            Zapier or scripts.
          </p>
          <code className="block text-xs break-all bg-stone-100 border rounded-lg p-3 font-mono">
            {newKeyToken}
          </code>
          <DialogFooter>
            <Button variant="outline" onClick={() => newKeyToken && copyText(newKeyToken, 'Key')}>
              <Copy className="h-4 w-4 mr-2" />
              Copy key
            </Button>
            <Button onClick={() => setNewKeyToken(null)}>Done</Button>
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
