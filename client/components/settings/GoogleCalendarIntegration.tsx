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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('settingsIntegrationsPage.googleCalendar');
  const tt = useTranslations('settingsIntegrationsPage.googleCalendar.toasts');
  const ts = useTranslations('settingsIntegrationsPage.shared');
  const tc = useTranslations('common');
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
        toast.error(tt('blockedAccess'));
        return;
      }
      if (result === 'error') {
        toast.error(tt('connectFailed'));
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
        toast.success(tt('connected'));
      } else if (result === 'cancelled') {
        applyPatch({ calendar_connected: false });
        toast.error(tt('cancelled'));
      } else {
        applyPatch({ calendar_connected: false });
        toast.error(tt('statusNotUpdated'));
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
            toast.success(tt('disconnected'));
          },
          onError: () => toast.error(tt('disconnectFailed')),
        }
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <IntegrationCard
      icon={<Calendar className="h-4 w-4 text-stone-500" />}
      title={t('title')}
      description={isConnected ? t('descriptionConnected') : t('descriptionDisconnected')}
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
                {t('disconnect')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('disconnectTitle')}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">{t('disconnectDesc')}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
                  {tc('cancel')}
                </Button>
                <Button variant="destructive" onClick={handleDisconnect} disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? ts('disconnecting') : t('disconnect')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            {gmailConnected && !isConnected ? (
              <p className="text-xs text-amber-800 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 mb-4">
                {t('gmailMissingCalendarWarning')}
              </p>
            ) : null}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={busy || stateLoading}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? ts('connecting') : t('connectWithGoogleCalendar')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    {t('connectTitle')}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">{t('connectDesc')}</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {tc('cancel')}
                  </Button>
                  <Button onClick={handleConnect} disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {busy ? ts('connecting') : t('continueWithGoogle')}
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
