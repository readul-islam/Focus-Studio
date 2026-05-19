import React, { useState } from 'react';
import { CheckCircle2, Loader2, BookOpen } from 'lucide-react';
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
import { openNotionOAuthPopup } from '@/lib/notion-connect';
import { gooeyToast as toast } from 'goey-toast';

type Props = {
  isConnected: boolean;
  isLoading: boolean;
};

const NotionIntegration = ({ isConnected, isLoading: stateLoading }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { refetch: getNotionAuthUrl } = useFetch('notion/connect/', { enabled: false });
  const { mutateAsync: disconnectNotion } = usePost();
  const queryClient = useQueryClient();

  const refreshState = () => {
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);
    const result = await openNotionOAuthPopup(getNotionAuthUrl);
    setIsLoading(false);

    if (result === 'success') {
      refreshState();
      toast.success('Notion connected.');
      return;
    }
    if (result === 'error') {
      toast.error('Could not connect Notion. Check server NOTION_* env vars.');
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await disconnectNotion(
      { url: 'notion/disconnect/', data: {} },
      {
        onSuccess: () => {
          setIsDisconnectDialogOpen(false);
          refreshState();
          toast.success('Notion disconnected.');
        },
        onError: () => toast.error('Failed to disconnect Notion.'),
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
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-stone-500" />
            Notion
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          Your studio workspace is linked. Use Notion databases in automations via Zapier or the API.
        </p>
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
              <DialogTitle>Disconnect Notion?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Focuspilot will lose access to your Notion workspace. You can reconnect anytime.
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
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-stone-50 p-5">
      <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-stone-500" />
        Notion
      </span>
      <p className="text-xs text-stone-500 mt-1 mb-4">
        Connect your Notion workspace to sync pages and databases with Focuspilot automations.
      </p>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Connecting...' : 'Connect Notion'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Notion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            You will authorize Focuspilot in Notion. Choose the pages and databases you want to share
            with the integration.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Connecting...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotionIntegration;
