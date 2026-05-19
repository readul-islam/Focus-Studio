import React, { useState } from 'react';
import { Loader2, PlugZap, RefreshCw } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';
import { IntegrationCard } from './IntegrationCard';

const XeroIntegration = ({
  isConnected,
  isLoading: stateLoading,
}: {
  isConnected: boolean;
  isLoading: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [showReloadTip, setShowReloadTip] = useState(false);
  const { user } = useUser();
  const { mutateAsync: disconnectXero } = usePost();
  const queryClient = useQueryClient();

  const refreshIntegrationState = () => {
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
  };

  const handleConnect = () => {
    const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/xero/xero/connect/?user_id=${user?.id}`;
    const popup = window.open(authUrl, 'XeroAuth', 'width=600,height=700');
    if (!popup) return;

    setIsLoading(true);

    let cleaned = false;
    const cleanup = (success: boolean) => {
      if (cleaned) return;
      cleaned = true;
      clearInterval(pollInterval);
      popup?.close();
      setIsLoading(false);
      if (success) {
        refreshIntegrationState();
        setShowReloadTip(true);
      }
    };

    const pollInterval = setInterval(() => {
      if (popup?.closed) {
        cleanup(false);
        return;
      }
      try {
        const href = popup?.location?.href ?? '';
        if (href.includes('/oauth/xero/callback')) {
          const status = new URL(href).searchParams.get('status');
          cleanup(status === 'success');
        }
      } catch {
        /* cross-origin */
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await disconnectXero(
      { url: 'xero/xero/disconnect/', data: {} },
      {
        onSuccess: () => {
          setIsDisconnectDialogOpen(false);
          refreshIntegrationState();
        },
        onError: () => {},
      }
    );
    setIsLoading(false);
  };

  return (
    <IntegrationCard
      icon={<PlugZap className="h-4 w-4 text-stone-500" />}
      title="Xero"
      description={
        isConnected
          ? 'Invoices and expenses are syncing with Xero.'
          : 'Sync invoices, expenses, and financials with Xero.'
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
                <DialogTitle>Disconnect Xero?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                Focuspilot will stop syncing with Xero. You can reconnect anytime.
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
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 flex-1">Connection complete. Reload if status is stale.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-xs font-medium text-blue-700 underline"
                >
                  Reload
                </button>
              </div>
            ) : null}
            <Button size="sm" onClick={handleConnect} disabled={isLoading || stateLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Connecting...' : 'Connect with Xero'}
            </Button>
          </>
        )
      }
    />
  );
};

export default XeroIntegration;
