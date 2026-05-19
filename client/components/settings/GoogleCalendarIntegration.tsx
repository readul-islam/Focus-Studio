import React, { useState } from 'react';
import { Calendar, Loader2, RefreshCw } from 'lucide-react';
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

type GoogleCalendarIntegrationProps = {
  isConnected: boolean;
  isLoading: boolean;
  gmailConnected?: boolean;
};

const GoogleCalendarIntegration = ({
  isConnected,
  isLoading: stateLoading,
  gmailConnected = false,
}: GoogleCalendarIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [showReloadTip, setShowReloadTip] = useState(false);
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const { mutateAsync: disconnectGmail } = usePost();
  const queryClient = useQueryClient();

  const refreshIntegrationState = () => {
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
    queryClient.refetchQueries({ queryKey: ['gmail/calendar/events/'] });
    queryClient.refetchQueries({ queryKey: ['user/dashboard/'] });
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);
    const result = await openGmailOAuthPopup(getGmailAuthUrl);
    setIsLoading(false);

    if (result === 'success') {
      refreshIntegrationState();
      setShowReloadTip(true);
      toast.success('Google Calendar connected.');
      return;
    }
    if (result === 'access_denied') {
      toast.error('Google blocked access. Add your email under OAuth → Test users.');
      return;
    }
    if (result === 'error') {
      toast.error('Could not connect. Check server GMAIL_* env vars.');
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
        onError: () => toast.error('Failed to disconnect.'),
      }
    );
    setIsLoading(false);
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
                <DialogTitle>Disconnect Google Calendar?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                This disconnects Google (Gmail Inbox uses the same OAuth connection).
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
            {gmailConnected && !isConnected ? (
              <p className="text-xs text-amber-800 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 mb-4">
                Gmail is connected but Calendar access is missing. Reconnect and allow Calendar
                permissions.
              </p>
            ) : null}
            {showReloadTip ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                <RefreshCw className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 flex-1">Connected. Reload if Calendar looks empty.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-xs font-medium text-blue-700 underline"
                >
                  Reload
                </button>
              </div>
            ) : null}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={isLoading || stateLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Connecting...' : 'Connect with Google Calendar'}
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

export default GoogleCalendarIntegration;
