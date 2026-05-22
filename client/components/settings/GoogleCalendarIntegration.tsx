import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
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
import { useIntegrationStatusContext } from '@/components/settings/integration-status-context';
import { gooeyToast as toast } from 'goey-toast';
import { IntegrationCard } from './IntegrationCard';

type GoogleCalendarIntegrationProps = {
  isConnected: boolean;
  isLoading: boolean;
  gmailConnected?: boolean;
  isSyncing?: boolean;
};

const GoogleCalendarIntegration = ({
  isConnected,
  isLoading: stateLoading,
  gmailConnected = false,
  isSyncing,
}: GoogleCalendarIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const { mutateAsync: disconnectGmail } = usePost();
  const queryClient = useQueryClient();
  const { applyPatch, waitForStatus } = useIntegrationStatusContext();

  const busy = isConnecting || isSyncing;

  const handleConnect = async () => {
    setIsConnecting(true);
    setIsDialogOpen(false);

    try {
      const result = await openGmailOAuthPopup(getGmailAuthUrl);

      if (result === 'access_denied') {
        toast.error('Google blocked access. Add your email under OAuth → Test users.');
        return;
      }
      if (result === 'error') {
        toast.error('Could not connect. Check server GMAIL_* env vars.');
        return;
      }

      const connected = await confirmIntegrationConnection({
        applyPatch,
        waitForStatus,
        patch: { gmail_connected: true, calendar_connected: true },
        predicate: (s) => s.calendar_connected === true,
      });

      if (connected) {
        await queryClient.invalidateQueries({ queryKey: ['gmail/calendar/events/'] });
        await queryClient.invalidateQueries({ queryKey: ['user/dashboard/'] });
        toast.success('Google Calendar connected.');
      } else if (result === 'cancelled') {
        applyPatch({ calendar_connected: false });
        toast.error('Calendar connection was cancelled.');
      } else {
        applyPatch({ calendar_connected: false });
        toast.error('Calendar connected to Google but status did not update. Please try again.');
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
            await waitForStatus((s) => !s.calendar_connected);
            await queryClient.invalidateQueries({ queryKey: ['gmail/calendar/events/'] });
            toast.success('Google Calendar disconnected.');
          },
          onError: () => toast.error('Failed to disconnect.'),
        }
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <IntegrationCard
      icon={<Calendar className="h-4 w-4 text-stone-500" />}
      title="Google Calendar"
      description={
        isConnected
          ? 'Calendar sync for studio schedule and Daily Brief.'
          : 'Sync meetings and deadlines with Google Calendar.'
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
                <DialogTitle>Disconnect Google Calendar?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                This disconnects Google (Gmail Inbox uses the same OAuth connection).
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
          <>
            {gmailConnected && !isConnected ? (
              <p className="text-xs text-amber-800 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 mb-4">
                Gmail is connected but Calendar access is missing. Reconnect and allow Calendar
                permissions.
              </p>
            ) : null}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={busy || stateLoading}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? 'Connecting...' : 'Connect with Google Calendar'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    Connect Google Calendar
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                  Uses Google OAuth (same as Gmail). Enable Calendar API in Google Cloud Console.
                </p>
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
          </>
        )
      }
    />
  );
};

export default GoogleCalendarIntegration;
