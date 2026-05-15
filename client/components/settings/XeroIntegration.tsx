import React, { useState } from 'react';
import { Loader2, PlugZap, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import useUser from '@/hooks/useUser';
import { usePost } from '@/hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';

const XeroIntegration = ({ isConnected, isLoading: stateLoading }: { isConnected: boolean; isLoading: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [showReloadTip, setShowReloadTip] = useState(false);
  const { user } = useUser();
  const { mutateAsync: disconnectXero } = usePost();
  const queryClient = useQueryClient();

  const handleConnect = () => {
    const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/xero/xero/connect/?user_id=${user?.id}`;
    const popup = window.open(authUrl, 'XeroAuth', 'width=600,height=700');
    if (!popup) return;

    setIsLoading(true);
    setIsDialogOpen(false);

    let cleaned = false;

    const cleanup = (success: boolean) => {
      if (cleaned) return;
      cleaned = true;
      clearInterval(pollInterval);
      popup?.close();
      setIsLoading(false);
      setShowReloadTip(true);
    };

    // Poll the popup URL — works even when window.opener is nulled by cross-origin redirects.
    // Reading popup.location.href throws a SecurityError when popup is on a cross-origin page,
    // so we catch that and do nothing until it lands back on our origin.
    const pollInterval = setInterval(() => {
      if (popup?.closed) { cleanup(false); return; }
      try {
        const href = popup?.location?.href ?? '';
        if (href.includes('/oauth/xero/callback')) {
          const status = new URL(href).searchParams.get('status');
          cleanup(status === 'success');
        }
      } catch {
        // popup is on a cross-origin page (Xero) — keep waiting
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
          queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
        },
        onError: () => {},
      }
    );
    setIsLoading(false);
  };

  if (stateLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-16 rounded bg-stone-200 mb-2" />
        <div className="h-3 w-40 rounded bg-stone-100 mb-5" />
        <div className="h-8 w-24 rounded bg-stone-200" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-900">Xero</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-4">Invoices and expenses are syncing with Xero.</p>
        <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200">
              Disconnect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Xero?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              This will stop syncing your data with Xero. You can reconnect at any time.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-stone-50 p-5">
      <span className="text-sm font-semibold text-gray-900">Xero</span>
      <p className="text-xs text-stone-500 mt-1 mb-4">Sync invoices, expenses and financials with Xero.</p>
      {showReloadTip && (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-700 flex-1">Connection complete. Reload the page to see your Xero status.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 shrink-0"
          >
            Reload now
          </button>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={isLoading || stateLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Connecting...' : 'Connect with Xero'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlugZap className="h-5 w-5 text-gray-600" />
              Connect Xero
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Before continuing, please ensure the required currency is enabled in your Xero organisation.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default XeroIntegration;
