import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Copy, ExternalLink, Loader2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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

type NotionDatabase = {
  id: string;
  title: string;
  url?: string;
};

const NotionIntegration = ({ isConnected, isLoading: stateLoading }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { refetch: getNotionAuthUrl } = useFetch('notion/connect/', { enabled: false });
  const { data: notionStatus } = useFetch(isConnected ? 'notion/status/' : null);
  const { mutateAsync: disconnectNotion } = usePost();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const databasesUrl = browseOpen
    ? `notion/databases/?q=${encodeURIComponent(debouncedSearch)}`
    : null;
  const {
    data: databases,
    isLoading: databasesLoading,
    isError: databasesError,
    error: databasesFetchError,
    refetch: refetchDatabases,
  } = useFetch(databasesUrl);

  const databasesApiError =
    databasesFetchError &&
    typeof databasesFetchError === 'object' &&
    'response' in databasesFetchError
      ? (databasesFetchError as { response?: { data?: { error?: string } } }).response?.data
          ?.error
      : undefined;

  const dbList: NotionDatabase[] = Array.isArray(databases) ? databases : [];

  const refreshState = () => {
    queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
    queryClient.refetchQueries({ queryKey: ['notion/status/'] });
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

  function copyId(id: string) {
    navigator.clipboard.writeText(id).then(
      () => toast.success('Database ID copied.'),
      () => toast.error('Copy failed.')
    );
  }

  function openBrowse() {
    setSearch('');
    setDebouncedSearch('');
    setBrowseOpen(true);
  }

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
    const workspace = notionStatus?.workspace_name;

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
          {workspace
            ? `Workspace: ${workspace}. Browse databases shared with Focuspilot.`
            : 'Browse databases shared with your Notion integration.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={openBrowse}>
            Browse databases
          </Button>
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

        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Notion databases</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-stone-500 -mt-2">
              Only databases you shared when connecting Notion appear here. Copy an ID for Zapier or
              open in Notion.
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                className="pl-9"
                placeholder="Search databases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto rounded-lg border border-stone-200 divide-y divide-stone-100">
              {databasesLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : databasesError ? (
                <div className="p-4 text-sm text-red-600 text-center space-y-2">
                  <p>Could not load databases from Notion.</p>
                  {databasesApiError ? (
                    <p className="text-xs font-mono text-red-500 break-all">{databasesApiError}</p>
                  ) : null}
                  <p className="text-xs text-stone-600">
                    Reconnect Notion on this environment (localhost uses its own token).
                  </p>
                </div>
              ) : dbList.length === 0 ? (
                <p className="p-4 text-sm text-stone-500 text-center">
                  No databases found. In Notion, open a database → ••• → Connect to → your
                  Focuspilot integration.
                </p>
              ) : (
                dbList.map((db) => (
                  <div
                    key={db.id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-stone-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{db.title}</p>
                      <p className="text-xs text-stone-400 font-mono truncate">{db.id}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => copyId(db.id)}
                        title="Copy database ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {db.url ? (
                        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                          <a href={db.url} target="_blank" rel="noopener noreferrer" title="Open in Notion">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => refetchDatabases()}>
                Refresh
              </Button>
              <Button onClick={() => setBrowseOpen(false)}>Done</Button>
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
        Connect your Notion workspace to browse databases and use them in automations.
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
