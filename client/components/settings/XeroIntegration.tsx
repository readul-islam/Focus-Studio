import React, { useState } from 'react';

import { Loader2, PlugZap } from 'lucide-react';

import { Button } from '../ui/button';

import {

  Dialog,

  DialogContent,

  DialogFooter,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from '../ui/dialog';

import useUser from '@/hooks/useUser';

import { usePost } from '@/hooks/usePost';

import { confirmIntegrationConnection } from '@/lib/integrations/confirm-connection';

import { useIntegrationStatusContext } from '@/components/settings/integration-status-context';

import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

import { IntegrationCard } from './IntegrationCard';



const XeroIntegration = ({

  isConnected,

  isLoading: stateLoading,

  isSyncing,

}: {

  isConnected: boolean;

  isLoading: boolean;

  isSyncing?: boolean;

}) => {

  const t = useTranslations('settingsIntegrationsPage.xero');
  const tt = useTranslations('settingsIntegrationsPage.xero.toasts');
  const ts = useTranslations('settingsIntegrationsPage.shared');
  const tc = useTranslations('common');

  const [isConnecting, setIsConnecting] = useState(false);

  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);

  const { user } = useUser();

  const { mutateAsync: disconnectXero } = usePost();

  const { applyPatch, waitForStatus } = useIntegrationStatusContext();



  const busy = isConnecting || isSyncing;



  const handleConnect = () => {

    const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/xero/xero/connect/?user_id=${user?.id}`;

    const popup = window.open(authUrl, 'XeroAuth', 'width=600,height=700');

    if (!popup) return;



    setIsConnecting(true);



    let cleaned = false;

    const pollInterval = setInterval(() => {

      if (popup?.closed) {

        setTimeout(() => {

          if (!cleaned) void finishConnect(false);

        }, 900);

        return;

      }

      try {

        const href = popup?.location?.href ?? '';

        if (href.includes('/oauth/xero/callback')) {

          const status = new URL(href).searchParams.get('status');

          void finishConnect(status === 'success');

        }

      } catch {

        /* cross-origin */

      }

    }, 500);



    const finishConnect = async (oauthSuccess: boolean) => {

      if (cleaned) return;

      cleaned = true;

      clearInterval(pollInterval);

      popup?.close();



      try {

        const connected = await confirmIntegrationConnection({

          applyPatch,

          waitForStatus,

          patch: { xero_connected: true },

          predicate: (s) => s.xero_connected === true,

        });



        if (connected) {

          toast.success(tt('connected'));

        } else if (!oauthSuccess) {

          applyPatch({ xero_connected: false });

          toast.error(tt('cancelled'));

        } else {

          applyPatch({ xero_connected: false });

          toast.error(tt('statusNotUpdated'));

        }

      } finally {

        setIsConnecting(false);

      }

    };

  };



  const handleDisconnect = async () => {

    setIsConnecting(true);

    try {

      await disconnectXero(

        { url: 'xero/xero/disconnect/', data: {} },

        {

          onSuccess: async () => {

            setIsDisconnectDialogOpen(false);

            applyPatch({ xero_connected: false });

            await waitForStatus((s) => !s.xero_connected);

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

      icon={<PlugZap className="h-4 w-4 text-stone-500" />}

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

              <p className="text-sm text-gray-600">

                {t('disconnectDesc')}

              </p>

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

          <Button size="sm" onClick={handleConnect} disabled={busy || stateLoading}>

            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {busy ? ts('connecting') : t('connectWithXero')}

          </Button>

        )

      }

    />

  );

};



export default XeroIntegration;

