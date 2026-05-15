import React, { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { usePost } from '@/hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const GmailIntegration = ({isConnected , isLoading:stateLoading, compact}: {isConnected: boolean , isLoading: boolean, compact?: boolean}) => {
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const [isLoading , setIsLoading] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const {mutateAsync: disconnectGmail} = usePost();
  const queryClient = useQueryClient();
  
const handleConnect = async () => {
  setIsLoading(true);

  const { data: responseData } = await getGmailAuthUrl();

  let authUrl: string | null = null;
  if (typeof responseData === 'string') {
    authUrl = responseData;
  } else if (responseData && typeof responseData === 'object' && 'auth_url' in responseData) {
    authUrl = responseData.auth_url;
  }

  if (!authUrl) {
    console.error('Failed to get auth URL', responseData);
    setIsLoading(false);
    return;
  }

  const popup = window.open(authUrl, 'GmailAuth', 'width=600,height=700');
  if (!popup) {
    setIsLoading(false);
    return;
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'OAUTH_SUCCESS') {
      popup.close();
      cleanup();
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      queryClient.refetchQueries({ queryKey: ['user/dashboard/'] });
      queryClient.refetchQueries({ queryKey: ['/gmail/threads/'] });
      window.location.reload()
    }
  };

  const popupCheckInterval = setInterval(() => {
    if (popup?.closed) {
      cleanup();
    }
  }, 500);

  const cleanup = () => {
    setIsLoading(false);
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
    queryClient.refetchQueries({ queryKey: ['user/dashboard/'] });
    queryClient.refetchQueries({ queryKey: ['/gmail/threads/'] });
    clearInterval(popupCheckInterval);
    window.removeEventListener('message', handleMessage);
    popup?.close();
    window.location.reload()  
  };

  window.addEventListener('message', handleMessage);
};

  
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    await disconnectGmail({url: 'gmail/disconnect/' ,data: {}},{
      onSuccess: () => {
        setIsLoading(false);
        setIsDisconnectDialogOpen(false);
        queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
        queryClient.refetchQueries({ queryKey: ['gmail/threads/'] });
        window.location.reload()
      },
      onError: () => {
        setIsLoading(false);
      }
    });
    setIsLoading(false);
  };

  // Compact mode: just a small connect button for inline banners
  if (compact) {
    if (stateLoading) return <div className="h-7 w-20 rounded bg-stone-200 animate-pulse" />;
    if (isConnected) return null;
    return (
      <Button size="sm" className="h-7 text-xs flex-shrink-0" onClick={handleConnect} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
        {isLoading ? 'Connecting...' : 'Connect'}
      </Button>
    );
  }

  // Show skeleton when loading
  if (stateLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-between">
            <div className="h-6 w-24 bg-white rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-white rounded animate-pulse"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-32 bg-white rounded animate-pulse"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="h-10 w-24 bg-white rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-900">Google</span>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="capitalize">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-600">Sync emails</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {isConnected ? (
          <>
            <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Disconnect</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disconnect Google?</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to disconnect? We will stop fetching your meetings and emails.
                  </p>
                </div>
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
          </>
        ) : (
          <Button onClick={() => handleConnect()} disabled={isLoading || stateLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Connecting...' : 'Connect'}</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GmailIntegration;
