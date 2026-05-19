import React, { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
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
import { gooeyToast as toast } from 'goey-toast';
import { IntegrationCard } from './IntegrationCard';
import { GmailIcon } from '@/components/icons/GmailIcon';

type GmailIntegrationProps = {
  isConnected: boolean;
  isLoading: boolean;
  compact?: boolean;
};

const GmailIntegration = ({ isConnected, isLoading: stateLoading, compact }: GmailIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [showReloadTip, setShowReloadTip] = useState(false);
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const { mutateAsync: disconnectGmail } = usePost();
  const queryClient = useQueryClient();

  const refreshIntegrationState = () => {
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
    queryClient.refetchQueries({ queryKey: ['gmail/threads/'] });
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);

    const result = await openGmailOAuthPopup(getGmailAuthUrl);
    setIsLoading(false);

    if (result === 'success') {
      refreshIntegrationState();
      setShowReloadTip(true);
      toast.success('Gmail connected.');
      return;
    }

    if (result === 'access_denied') {
      toast.error(
        'Google blocked access. Add your email under OAuth consent screen → Test users in Google Cloud Console.'
      );
      return;
    }

    if (result === 'error') {
      toast.error('Could not connect Gmail. Check server GMAIL_* env vars.');
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await disconnectGmail(
      { url: 'gmail/disconnect/', data: {} },
      {
        onSuccess: () => {
          setIsDisconnectDialogOpen(false);
          refreshIntegrationState();
          window.location.reload();
        },
        onError: () => toast.error('Failed to disconnect Gmail.'),
      }
    );
    setIsLoading(false);
  };

  if (compact) {
    if (stateLoading) {
      return <div className="h-7 w-20 rounded bg-stone-200 animate-pulse" />;
    }
    if (isConnected) return null;
    return (
      <Button size="sm" className="h-7 text-xs flex-shrink-0" onClick={handleConnect} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
        {isLoading ? 'Connecting...' : 'Connect'}
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
      isLoading={stateLoading}
      status={isConnected ? 'connected' : null}
      footer={
        isConnected ? (
          <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200"
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
                <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            {showReloadTip ? (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                <RefreshCw className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 flex-1">
                  Connection complete. Reload to refresh your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 shrink-0"
                >
                  Reload now
                </button>
              </div>
            ) : null}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={isLoading || stateLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Connecting...' : 'Connect with Gmail'}
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
                  <Button onClick={handleConnect} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      }
    />
  );
};

export default GmailIntegration;
