import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';
import { openGmailOAuthPopup } from '@/lib/gmail-connect';
import { confirmIntegrationConnection } from '@/lib/integrations/confirm-connection';
import { refreshIntegrationStatus, patchIntegrationStatus } from '@/lib/integrations/refresh-status';
import { useIntegrationStatusContextOptional } from '@/components/settings/integration-status-context';
import { gooeyToast as toast } from 'goey-toast';
import { IntegrationCard } from './IntegrationCard';
import { GmailIcon } from '@/components/icons/GmailIcon';

type GmailIntegrationProps = {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing?: boolean;
  compact?: boolean;
};

const GmailIntegration = ({
  isConnected,
  isLoading: stateLoading,
  isSyncing,
  compact,
}: GmailIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const { mutateAsync: disconnectGmail } = usePost();
  const queryClient = useQueryClient();
  const integrationCtx = useIntegrationStatusContextOptional();

  const applyPatch =
    integrationCtx?.applyPatch ??
    ((patch) => patchIntegrationStatus(queryClient, patch));
  const waitForStatus =
    integrationCtx?.waitForStatus ??
    (async (predicate) => {
      await refreshIntegrationStatus(queryClient, { until: predicate });
      return queryClient.getQueryData(['user/integration-status/']);
    });

  const busy = isConnecting || (integrationCtx ? isSyncing : false);

  const handleConnect = async () => {
    setIsConnecting(true);
    setIsDialogOpen(false);

    try {
      const result = await openGmailOAuthPopup(getGmailAuthUrl);

      if (result === 'access_denied') {
        toast.error(
          'Google blocked access. Add your email under OAuth consent screen → Test users in Google Cloud Console.'
        );
        return;
      }

      if (result === 'error') {
        toast.error('Could not connect Gmail. Check server GMAIL_* env vars.');
        return;
      }

      // success or cancelled — server may still have saved the token when the popup closed
      const connected = await confirmIntegrationConnection({
        applyPatch,
        waitForStatus,
        patch: { gmail_connected: true },
        predicate: (s) => s.gmail_connected === true,
      });

      if (connected) {
        await queryClient.invalidateQueries({ queryKey: ['gmail/threads/'] });
        toast.success('Gmail connected.');
      } else if (result === 'cancelled') {
        applyPatch({ gmail_connected: false });
        toast.error('Gmail connection was cancelled.');
      } else {
        applyPatch({ gmail_connected: false });
        toast.error('Gmail connected to Google but status did not update. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await disconnectGmail(
        { url: 'gmail/disconnect/', data: {} },
        {
          onSuccess: async () => {
            setIsDisconnectDialogOpen(false);
            applyPatch({ gmail_connected: false, calendar_connected: false });
            await waitForStatus((s) => !s.gmail_connected);
            await queryClient.invalidateQueries({ queryKey: ['gmail/threads/'] });
            toast.success('Gmail disconnected.');
          },
          onError: () => toast.error('Failed to disconnect Gmail.'),
        }
      );
    } finally {
      setIsConnecting(false);
    }
  };

  if (compact) {
    if (stateLoading) {
      return <div className="h-7 w-20 rounded bg-stone-200 animate-pulse" />;
    }
    if (isConnected) return null;
    return (
      <Button size="sm" className="h-7 text-xs flex-shrink-0" onClick={handleConnect} disabled={busy}>
        {busy && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
        {busy ? 'Connecting...' : 'Connect'}
      </Button>
    );
  }

  return (
    <IntegrationCard
      icon={<GmailIcon className="h-4 w-4" />}
      title="Gmail"
      description={
        isConnected
          ? 'Your inbox is syncing for AI summaries and categorisation.'
          : 'Connect Gmail to power the AI Inbox — categorised emails, summaries, and suggested actions.'
      }
      isLoading={stateLoading && !isConnected}
      status={isConnected ? 'connected' : null}
      footer={
        isConnected ? (
          <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200"
                disabled={busy}
              >
                Disconnect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disconnect Gmail?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                This will stop syncing your emails. You can reconnect from Settings or Inbox.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDisconnect} disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={busy || stateLoading}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? 'Connecting...' : 'Connect with Gmail'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GmailIcon className="h-5 w-5" />
                  Connect Gmail
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Sign in with Google and allow access to Gmail. Connect Google Calendar separately
                  under Integrations if needed.
                </p>
                <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  If Google shows &quot;Access blocked&quot; (403), add your account under OAuth
                  consent screen → Test users in Google Cloud Console.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect} disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? 'Connecting...' : 'Continue with Google'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }
    />
  );
};

export default GmailIntegration;
