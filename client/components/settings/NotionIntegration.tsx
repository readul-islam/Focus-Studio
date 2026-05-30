import React, { useEffect, useState } from 'react';
import { BookOpen, Copy, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { IntegrationCard } from './IntegrationCard';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';
import { openNotionOAuthPopup } from '@/lib/notion-connect';
import { confirmIntegrationConnection } from '@/lib/integrations/confirm-connection';
import { useIntegrationStatusContext } from '@/components/settings/integration-status-context';
import { putData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

type Props = {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing?: boolean;
};

type NotionDatabase = {
  id: string;
  title: string;
  url?: string;
};

type NotionMapping = {
  database_id: string;
  database_title: string;
  title_property: string;
  status_property?: string;
  is_enabled: boolean;
  last_synced_at?: string | null;
};

type SyncResult = {
  tasks_updated?: number;
  tasks_skipped?: number;
  created: number;
  updated: number;
  skipped: number;
  total_pages?: number;
  last_synced_at?: string;
  error?: string;
};

const NotionIntegration = ({ isConnected, isLoading: stateLoading, isSyncing }: Props) => {
  const t = useTranslations('settingsIntegrationsPage.notion');
  const tt = useTranslations('settingsIntegrationsPage.notion.toasts');
  const ts = useTranslations('settingsIntegrationsPage.shared');
  const tc = useTranslations('common');
  const [isConnecting, setIsConnecting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDbId, setSelectedDbId] = useState('');
  const [selectedDbTitle, setSelectedDbTitle] = useState('');
  const [titleProperty, setTitleProperty] = useState('Name');
  const [statusProperty, setStatusProperty] = useState('');
  const [savingMapping, setSavingMapping] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [parentPageId, setParentPageId] = useState('');
  const [savingParentPage, setSavingParentPage] = useState(false);

  const { refetch: getNotionAuthUrl } = useFetch('notion/connect/', { enabled: false });
  const { data: notionStatus } = useFetch(isConnected ? 'notion/status/' : null);
  const { mutateAsync: disconnectNotion } = usePost();
  const queryClient = useQueryClient();
  const { applyPatch, waitForStatus } = useIntegrationStatusContext();
  const busy = isConnecting || isSyncing;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const pid = (notionStatus as { parent_page_id?: string })?.parent_page_id;
    if (pid) setParentPageId(pid);
  }, [notionStatus]);

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

  const pickerDbsUrl = mappingOpen ? 'notion/databases/' : null;
  const { data: pickerDatabases = [] } = useFetch(pickerDbsUrl);
  const pickerDbList: NotionDatabase[] = Array.isArray(pickerDatabases) ? pickerDatabases : [];

  const schemaUrl = selectedDbId ? `notion/databases/${selectedDbId}/schema/` : null;
  const { data: schemaData } = useFetch(schemaUrl);

  const titleProperties: string[] = schemaData?.title_properties ?? [];
  const statusProperties: string[] = schemaData?.status_properties ?? [];

  const refreshNotionQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notion/status/'] });
    await queryClient.invalidateQueries({ queryKey: ['notion/mapping/'] });
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setIsConnectDialogOpen(false);

    try {
      const result = await openNotionOAuthPopup(getNotionAuthUrl);

      if (result === 'error') {
        toast.error(tt('connectFailed'));
        return;
      }

      const connected = await confirmIntegrationConnection({
        applyPatch,
        waitForStatus,
        patch: { notion_connected: true },
        predicate: (s) => s.notion_connected === true,
      });

      if (connected) {
        await refreshNotionQueries();
        toast.success(tt('connected'));
      } else if (result === 'cancelled') {
        applyPatch({ notion_connected: false });
        toast.error(tt('cancelled'));
      } else {
        applyPatch({ notion_connected: false });
        toast.error(tt('statusNotUpdated'));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await disconnectNotion(
        { url: 'notion/disconnect/', data: {} },
        {
          onSuccess: async () => {
            setIsDisconnectDialogOpen(false);
            setSettingsOpen(false);
            applyPatch({ notion_connected: false });
            await waitForStatus((s) => !s.notion_connected);
            await refreshNotionQueries();
            toast.success(tt('disconnected'));
          },
          onError: () => toast.error(tt('disconnectFailed')),
        }
      );
    } finally {
      setIsConnecting(false);
    }
  };

  function copyId(id: string) {
    navigator.clipboard.writeText(id).then(
      () => toast.success(tt('databaseIdCopied')),
      () => toast.error(tt('copyFailed'))
    );
  }

  function openBrowse() {
    setSearch('');
    setDebouncedSearch('');
    setBrowseOpen(true);
  }

  function openMapping(existing?: NotionMapping) {
    if (existing) {
      setSelectedDbId(existing.database_id);
      setSelectedDbTitle(existing.database_title);
      setTitleProperty(existing.title_property || 'Name');
      setStatusProperty(existing.status_property || '');
    } else {
      setSelectedDbId('');
      setSelectedDbTitle('');
      setTitleProperty('Name');
      setStatusProperty('');
    }
    setMappingOpen(true);
  }

  function pickDatabaseForSync(db: NotionDatabase) {
    setSelectedDbId(db.id);
    setSelectedDbTitle(db.title);
    setBrowseOpen(false);
    setMappingOpen(true);
  }

  useEffect(() => {
    if (schemaData?.default_title_property && selectedDbId) {
      setTitleProperty((prev) =>
        prev === 'Name' || !titleProperties.includes(prev)
          ? schemaData.default_title_property
          : prev
      );
    }
  }, [schemaData, selectedDbId, titleProperties]);

  async function handleSaveMapping() {
    if (!selectedDbId) {
      toast.error(tt('selectDatabaseFirst'));
      return;
    }
    setSavingMapping(true);
    try {
      await putData({
        url: 'notion/mapping/',
        data: {
          database_id: selectedDbId,
          database_title: selectedDbTitle,
          title_property: titleProperty,
          status_property: statusProperty || '',
          is_enabled: true,
        },
      });
      setMappingOpen(false);
      await refreshNotionQueries();
      toast.success(tt('syncConfigured'));
    } catch {
      toast.error(tt('saveMappingFailed'));
    } finally {
      setSavingMapping(false);
    }
  }

  async function handleSaveParentPage() {
    setSavingParentPage(true);
    try {
      await putData({
        url: 'notion/settings/',
        data: { parent_page_id: parentPageId.trim() },
      });
      await refreshNotionQueries();
      toast.success(tt('parentPageSaved'));
    } catch {
      toast.error(tt('saveParentPageFailed'));
    } finally {
      setSavingParentPage(false);
    }
  }

  async function handleSyncProjects() {
    setSyncing(true);
    try {
      const result = (await postData({
        url: 'notion/mapping/sync/',
        data: {},
      })) as SyncResult;
      setLastSyncResult(result);
      await refreshNotionQueries();
      if (result.error && !result.created && !result.updated) {
        toast.error(result.error);
      } else {
        const taskPart =
          result.tasks_updated != null
            ? tt('tasksUpdatedFromNotion', { count: result.tasks_updated })
            : '';
        toast.success(
          tt('syncDone', {
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
            taskPart,
          })
        );
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      }
    } catch {
      toast.error(tt('syncFailed'));
    } finally {
      setSyncing(false);
    }
  }

  const workspace = notionStatus?.workspace_name;
  const mapping = notionStatus?.mapping as NotionMapping | undefined;

  const cardDescription = isConnected
    ? mapping?.database_title
      ? t('cardDescProjectSync', {
          database: mapping.database_title,
          workspacePart: workspace ? t('workspacePart', { workspace }) : '',
        })
      : workspace
        ? t('cardDescWorkspace', { workspace })
        : t('cardDescBrowse')
    : t('cardDescDisconnected');

  return (
    <>
      <IntegrationCard
        icon={<BookOpen className="h-4 w-4 text-stone-500" />}
        title={t('title')}
        description={cardDescription}
        isLoading={stateLoading && !isConnected}
        status={isConnected ? 'connected' : null}
        showSettings={isConnected}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
        settingsTitle={t('settingsTitle')}
        settingsChildren={
          isConnected ? (
          <>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t('outbound')}</span>{' '}
              {t('outboundDescLong', {
                workspacePart: workspace ? t('workspacePart', { workspace }) : '',
              })}
            </p>
            <p className="text-xs text-stone-500">
              <span className="font-medium">{t('inbound')}</span> {t('inboundDescLong')}
            </p>
            <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50/80 p-3">
              <Label htmlFor="notion-parent-page" className="text-xs">
                {t('parentPageLabelOptional')}
              </Label>
              <Input
                id="notion-parent-page"
                placeholder={t('parentPagePlaceholder')}
                value={parentPageId}
                onChange={(e) => setParentPageId(e.target.value)}
                className="bg-white text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={savingParentPage}
                onClick={handleSaveParentPage}
              >
                {savingParentPage ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : null}
                {t('saveParentPage')}
              </Button>
            </div>
            {mapping ? (
              <p className="text-xs text-stone-500">
                {t('mappedDatabase')} <span className="font-medium">{mapping.database_title}</span>
                {mapping.last_synced_at
                  ? t('lastSyncAt', { date: new Date(mapping.last_synced_at).toLocaleString() })
                  : ''}
              </p>
            ) : (
              <p className="text-xs text-stone-500">{t('mapDatabaseHint')}</p>
            )}
            {lastSyncResult && !lastSyncResult.error ? (
              <p className="text-xs text-stone-500">
                {t('lastRunSummary', {
                  created: lastSyncResult.created,
                  updated: lastSyncResult.updated,
                  tasksPart:
                    lastSyncResult.tasks_updated != null && lastSyncResult.tasks_updated > 0
                      ? t('tasksFromNotionPart', { count: lastSyncResult.tasks_updated })
                      : '',
                  pagesPart:
                    lastSyncResult.total_pages != null
                      ? t('rowsInNotionPart', { count: lastSyncResult.total_pages })
                      : '',
                })}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" onClick={openBrowse}>
                {t('browseDatabases')}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => openMapping(mapping)}>
                {mapping ? t('editProjectSyncMapping') : t('setupProjectSync')}
              </Button>
              <Button
                className="justify-start"
                onClick={handleSyncProjects}
                disabled={!mapping || syncing}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {ts('syncing')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('syncProjectsNow')}
                  </>
                )}
              </Button>
            </div>
          </>
          ) : null
        }
        footer={
          isConnected ? (
            <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200"
                >
                  {t('disconnect')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('disconnectTitle')}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">{t('disconnectDescLong')}</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect} disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {busy ? ts('disconnecting') : t('disconnect')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={busy || stateLoading}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {busy ? ts('connecting') : t('connect')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('connectTitle')}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">{t('connectDescLong')}</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleConnect} disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {busy ? ts('connecting') : ts('continue')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <Dialog open={mappingOpen} onOpenChange={setMappingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mappingDialogTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-stone-500">{t('mappingDialogDesc')}</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t('databaseLabel')}</Label>
              <Select
                value={selectedDbId}
                onValueChange={(id) => {
                  const db = pickerDbList.find((d) => d.id === id);
                  setSelectedDbId(id);
                  setSelectedDbTitle(db?.title || '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('chooseDatabase')} />
                </SelectTrigger>
                <SelectContent>
                  {pickerDbList.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDbId ? (
              <>
                <div className="space-y-2">
                  <Label>{t('nameFieldLabel')}</Label>
                  <Select value={titleProperty} onValueChange={setTitleProperty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(titleProperties.length ? titleProperties : [titleProperty]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('statusFieldLabel')}</Label>
                  <Select
                    value={statusProperty || '__none__'}
                    onValueChange={(v) => setStatusProperty(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={ts('none')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{ts('none')}</SelectItem>
                      {statusProperties.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-stone-500">{t('statusMappingHint')}</p>
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveMapping} disabled={savingMapping || !selectedDbId}>
              {savingMapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tc('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('browseDialogTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-stone-500 -mt-2">{t('browseDialogDesc')}</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
            <Input
              className="pl-9"
              placeholder={t('searchDatabases')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto rounded-lg border border-stone-200 divide-y divide-stone-100">
            {databasesLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {tc('loading')}
              </div>
            ) : databasesError ? (
              <div className="p-4 text-sm text-red-600 text-center space-y-2">
                <p>{t('databasesLoadFailed')}</p>
                {databasesApiError ? (
                  <p className="text-xs font-mono text-red-500 break-all">{databasesApiError}</p>
                ) : null}
                <p className="text-xs text-stone-600">{t('reconnectHint')}</p>
              </div>
            ) : dbList.length === 0 ? (
              <p className="p-4 text-sm text-stone-500 text-center">{t('noDatabasesFound')}</p>
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
                      className="h-8 px-2 text-xs"
                      onClick={() => pickDatabaseForSync(db)}
                      title={t('useForProjectSync')}
                    >
                      {t('syncBtn')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => copyId(db.id)}
                      title={t('copyDatabaseId')}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {db.url ? (
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <a href={db.url} target="_blank" rel="noopener noreferrer" title={t('openInNotion')}>
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
              {ts('refresh')}
            </Button>
            <Button onClick={() => setBrowseOpen(false)}>{ts('done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotionIntegration;
