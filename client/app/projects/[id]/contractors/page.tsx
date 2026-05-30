'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, HardHat, Loader2, Search, UserPlus, Link2 } from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import { ContractorCard, ShareFilesDialog } from '@/components/contractor';
import { ContractorMessageDialog } from '@/components/contractor/ContractorMessageDialog';
import { ContractorProfileDrawer } from '@/components/contractor/ContractorProfileDrawer';
import type { ProjectContractor, TradeType, ContractorShare } from '@/lib/contractor/types';
import { TRADE_OPTIONS } from '@/lib/contractor/types';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { DeleteDialog } from '@/components/DeleteDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { getProjectPortalUrl } from '@/lib/contractor-portal-url';
import { useTranslations } from 'next-intl';

interface StudioContractor {
  id: number;
  name: string;
  surname: string;
  company_name: string;
  email: string;
  phone: string;
  trade: string;
  access_code: string;
  last_login: string | null;
  shared_items_count: number;
  shared_drawings_count: number;
}

interface ApiContractor {
  id: number;
  name: string;
  surname: string;
  company_name: string;
  email: string;
  phone: string;
  trade?: string;
  access_code?: string;
  last_login: string | null;
  item_count: number;
  drawing_count: number;
  confirmed_drawing_count: number;
  insurance_warning?: 'expired' | 'expiring_soon' | 'valid' | null;
  insurance_expiry?: string | null;
  insurance_document?: string | null;
  trade_cert?: string | null;
  shared_procurements: Array<{
    id: number;
    procurement: number;
    product_name: string;
    product_url: string;
    room: string;
    project_id: number;
    image: string | null;
    shared_at: string;
    viewed_at: string | null;
    is_viewed: boolean;
  }>;
  shared_documents: Array<{
    id: number;
    document: number;
    document_name: string;
    document_url: string;
    project_id: number;
    shared_at: string;
    viewed_at: string | null;
    is_viewed: boolean;
  }>;
}

// Map API response to ProjectContractor type
function mapApiContractorToProjectContractor(apiContractor: ApiContractor): ProjectContractor {
  const fullName = `${apiContractor.name} ${apiContractor.surname}`.trim();

  // Map shared procurements to shared_items
  const shared_items: ContractorShare[] = apiContractor.shared_procurements.map(proc => ({
    id: proc.id.toString(),
    contractor_id: apiContractor.id.toString(),
    item_type: 'procurement' as const,
    item_id: proc.procurement.toString(),
    item_name: proc.product_name,
    shared_at: proc.shared_at,
    shared_by: 'Studio',
    viewed_at: proc.viewed_at || undefined,
    view_count: proc.is_viewed ? 1 : 0,
  }));

  // Map shared documents to shared_drawings
  const shared_drawings: ContractorShare[] = apiContractor.shared_documents.map(doc => ({
    id: doc.id.toString(),
    contractor_id: apiContractor.id.toString(),
    item_type: 'drawing' as const,
    item_id: doc.document.toString(),
    item_name: doc.document_name,
    shared_at: doc.shared_at,
    shared_by: 'Studio',
    viewed_at: doc.viewed_at || undefined,
    view_count: doc.is_viewed ? 1 : 0,
  }));

  return {
    id: apiContractor.id.toString(),
    name: fullName || apiContractor.company_name,
    trade: 'General',
    trade_label: apiContractor.trade || undefined,
    access_code: apiContractor.access_code || undefined,
    insurance_expiry: apiContractor.insurance_expiry || undefined,
    insurance_warning: apiContractor.insurance_warning ?? undefined,
    insurance_document: apiContractor.insurance_document || undefined,
    trade_cert: apiContractor.trade_cert || undefined,
    token: `contractor-${apiContractor.id}`,
    status: 'active',
    created_at: new Date().toISOString(),
    last_accessed: apiContractor.last_login || undefined,
    shared_items,
    shared_drawings,
    activities: [],
    messages: [],
  };
}

export default function ProjectContractorsPage({ params }: { params: { id: string } }) {
  const t = useTranslations('projectContractorsPage');
  const tc = useTranslations('common');
  const [contractors, setContractors] = useState<ProjectContractor[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<'new' | 'existing'>('new');
  const [newContractor, setNewContractor] = useState({
    name: '',
    surname: '',
    company_name: '',
    email: '',
    phone: '',
    trade: ''
  });
  const [existingSearch, setExistingSearch] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const {can} = usePermissions();
  const projectEditPermission = can('projects.edit');

  // Message dialog state
  const [messageContractor, setMessageContractor] = useState<ProjectContractor | null>(null);

  // Share files dialog state
  const [shareFilesContractor, setShareFilesContractor] = useState<ProjectContractor | null>(null);

  // Profile drawer state
  const [profileContractor, setProfileContractor] = useState<ProjectContractor | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    contractorId: string;
    shareId: string;
    itemName: string;
    type: 'item' | 'drawing';
  } | null>(null);

  // Fetch contractors from API
  const { data: apiData, isLoading, refetch } = useFetch(
    `contractor_portal/project/${params.id}/contractors/`
  );

  const { data: projectData } = useFetch(`projects/projects/${params.id}/`);
  const projectPortalUrl = projectData?.access_token
    ? getProjectPortalUrl(projectData.access_token)
    : '';

  // Map API data to contractors
  useEffect(() => {
    if (apiData && Array.isArray(apiData)) {
      const mappedContractors = apiData.map(mapApiContractorToProjectContractor);
      setContractors(mappedContractors);
    }
  }, [apiData]);

  // Fetch studio contractors for "link existing" tab (only when dialog is open on that tab)
  const { data: studioContractorsData, isLoading: isLoadingStudio } = useFetch(
    isAddOpen && addTab === 'existing'
      ? `contractor_portal/studio-contractors?exclude_project_id=${params.id}`
      : null
  );
  const studioContractors = (studioContractorsData as StudioContractor[] | undefined) ?? [];

  const filteredStudioContractors = useMemo(() => {
    if (!existingSearch.trim()) return studioContractors;
    const q = existingSearch.toLowerCase();
    return studioContractors.filter(c =>
      `${c.name} ${c.surname}`.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.trade?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [studioContractors, existingSearch]);

  // Add new contractor mutation
  const { mutate: addContractor, isPending: isAdding } = usePost({
    onSuccess: (data: any) => {
      const accessCode = data?.access_code || 'N/A';
      if (data?.invite_sent === false) {
        toast.warning(`Contractor added (access code: ${accessCode}). Invite email could not be sent.`);
      } else {
        toast.success(`Contractor added. Invite sent — access code: ${accessCode}`);
      }
      refetch();
      closeAddDialog();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add contractor');
    },
  });

  // Link existing contractor mutation
  const { mutate: linkContractor, isPending: isLinking } = usePost({
    onSuccess: () => {
      toast.success('Contractor linked to project');
      refetch();
      closeAddDialog();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to link contractor');
    },
  });

  const closeAddDialog = () => {
    setIsAddOpen(false);
    setAddTab('new');
    setNewContractor({ name: '', surname: '', company_name: '', email: '', phone: '', trade: '' });
    setExistingSearch('');
    setSelectedContractorId(null);
  };

  const handleAddContractor = () => {
    const surname = newContractor.surname.trim() || newContractor.name.trim().split(' ').slice(-1)[0] || 'USER';
    if (!newContractor.name || !newContractor.email || !newContractor.trade) return;
    addContractor({
      url: 'contractor_portal/add/',
      data: {
        project_id: parseInt(params.id),
        name: newContractor.name,
        surname,
        company_name: newContractor.company_name,
        email: newContractor.email,
        phone: newContractor.phone,
        trade: newContractor.trade,
      },
    });
  };

  const handleLinkContractor = () => {
    if (!selectedContractorId) return;
    linkContractor({
      url: 'contractor_portal/add-existing/',
      data: { project_id: parseInt(params.id), contractor_id: selectedContractorId },
    });
  };

  const handleCopyLink = () => {
    if (!projectPortalUrl) {
      toast.error('Project portal link is not available yet');
      return;
    }
    navigator.clipboard.writeText(projectPortalUrl);
    toast.success('Project portal link copied');
  };

  const handleOpenPortal = () => {
    if (!projectPortalUrl) {
      toast.error('Project portal link is not available yet');
      return;
    }
    window.open(projectPortalUrl, '_blank');
  };

  // Delete mutations using POST
  const { mutate: deleteProcurement, isPending: isDeletingProcurement } = usePost({
    onSuccess: () => {
      toast.success('Item removed successfully');
      refetch();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove item');
    },
  });

  const { mutate: deleteDocument, isPending: isDeletingDocument } = usePost({
    onSuccess: () => {
      toast.success('Drawing removed successfully');
      refetch();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove drawing');
    },
  });

  // Open delete confirmation (receives only shareId from ContractorCard)
  const handleRemoveShare = (contractorId: string, shareId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    if (!contractor) return;

    // Find the share in either shared_items or shared_drawings
    const itemShare = contractor.shared_items.find(s => s.id === shareId);
    if (itemShare) {
      setDeleteTarget({
        contractorId,
        shareId,
        itemName: itemShare.item_name,
        type: 'item',
      });
      setDeleteDialogOpen(true);
      return;
    }

    const drawingShare = contractor.shared_drawings.find(s => s.id === shareId);
    if (drawingShare) {
      setDeleteTarget({
        contractorId,
        shareId,
        itemName: drawingShare.item_name,
        type: 'drawing',
      });
      setDeleteDialogOpen(true);
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return;

    const contractor = contractors.find(c => c.id === deleteTarget.contractorId);
    if (!contractor) return;

    if (deleteTarget.type === 'item') {
      const share = contractor.shared_items.find(s => s.id === deleteTarget.shareId);
      if (share) {
        deleteProcurement({
          url: 'contractor_portal/remove-shared-procurement/',
          data: {
            contractor_id: parseInt(deleteTarget.contractorId),
            procurement_id: parseInt(share.item_id),
          },
        });
      }
    } else {
      const share = contractor.shared_drawings.find(s => s.id === deleteTarget.shareId);
      if (share) {
        deleteDocument({
          url: 'contractor_portal/remove-shared-document/',
          data: {
            contractor_id: parseInt(deleteTarget.contractorId),
            document_id: parseInt(share.item_id),
          },
        });
      }
    }
  };

  // Filter contractors by search
  const filteredContractors = useMemo(() => {
    if (!searchText.trim()) return contractors;
    const searchLower = searchText.toLowerCase();
    return contractors.filter(c => c.name.toLowerCase().includes(searchLower) || c.trade.toLowerCase().includes(searchLower));
  }, [contractors, searchText]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-stone-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="  space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-10 w-64 h-9"
              />
            </div>
          </div>
          {projectEditPermission && <Dialog open={isAddOpen} onOpenChange={open => open ? setIsAddOpen(true) : closeAddDialog()}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('addContractor')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] bg-card border border-border/40 text-foreground max-h-[90vh] flex flex-col rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-lg text-foreground font-bold">{t('addContractor')}</DialogTitle>
              </DialogHeader>

              <Tabs value={addTab} onValueChange={v => setAddTab(v as 'new' | 'existing')} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid grid-cols-2 w-full bg-muted/65 p-1 rounded-xl border border-border/20">
                  <TabsTrigger value="new" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-semibold py-1.5 transition-all">
                    <UserPlus className="w-3.5 h-3.5" /> Create New
                  </TabsTrigger>
                  <TabsTrigger value="existing" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-semibold py-1.5 transition-all">
                    <Link2 className="w-3.5 h-3.5" /> Link Existing
                  </TabsTrigger>
                </TabsList>

                {/* CREATE NEW */}
                <TabsContent value="new" className="overflow-y-auto flex-1 mt-0">
                  <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder={t('firstNamePlaceholder')}
                          value={newContractor.name}
                          onChange={e => setNewContractor(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="surname" className="text-sm font-semibold text-foreground/80">
                          Surname <span className="text-muted-foreground font-normal">(for access code)</span>
                        </Label>
                        <Input
                          id="surname"
                          placeholder={t('lastNamePlaceholder')}
                          value={newContractor.surname}
                          onChange={e => setNewContractor(prev => ({ ...prev, surname: e.target.value }))}
                          className="bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company_name" className="text-sm font-semibold text-foreground/80">{t('companyName')}</Label>
                      <Input
                        id="company_name"
                        placeholder={t('companyPlaceholder')}
                        value={newContractor.company_name}
                        onChange={e => setNewContractor(prev => ({ ...prev, company_name: e.target.value }))}
                        className="bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={newContractor.email}
                        onChange={e => setNewContractor(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80">{t('phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        value={newContractor.phone}
                        onChange={e => setNewContractor(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="trade" className="text-sm font-semibold text-foreground/80">
                        Trade <span className="text-red-500">*</span>
                      </Label>
                      <Select value={newContractor.trade} onValueChange={value => setNewContractor(prev => ({ ...prev, trade: value }))}>
                        <SelectTrigger className="bg-background border-border/60 text-foreground rounded-xl focus:ring-primary">
                          <SelectValue placeholder={t('selectTrade')} />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl">
                          {TRADE_OPTIONS.map((trade) => (
                            <SelectItem key={trade} value={trade} className="hover:bg-accent/40 focus:bg-accent/40 rounded-lg">{trade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 border-t border-border/20 pt-4 mt-2">
                    <Button variant="outline" className="rounded-xl border-border/60 text-foreground hover:bg-accent" onClick={closeAddDialog}>{tc('cancel')}</Button>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm"
                      disabled={!newContractor.name || !newContractor.email || !newContractor.trade || isAdding}
                      onClick={handleAddContractor}
                    >
                      {isAdding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('adding')}</> : t('addContractorBtn')}
                    </Button>
                  </DialogFooter>
                </TabsContent>

                {/* LINK EXISTING */}
                <TabsContent value="existing" className="flex-1 flex flex-col min-h-0 mt-0">
                  <div className="py-4 flex flex-col gap-3 flex-1 min-h-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('searchLinkPlaceholder')}
                        className="pl-9 bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
                        value={existingSearch}
                        onChange={e => setExistingSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-72 space-y-1.5 pr-1 pl-0.5">
                      {isLoadingStudio ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      ) : filteredStudioContractors.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">{t('noContractorsFound')}</p>
                      ) : (
                        filteredStudioContractors.map(c => {
                          const fullName = `${c.name} ${c.surname}`.trim();
                          const isSelected = selectedContractorId === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedContractorId(isSelected ? null : c.id)}
                              className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                                isSelected
                                  ? 'border-primary bg-primary/10 shadow-sm'
                                  : 'border-border/60 text-foreground/80 hover:border-border hover:bg-accent/40 hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{fullName || c.company_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{c.company_name}{c.trade ? ` · ${c.trade}` : ''}</p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                                  <span className="text-xs font-mono text-muted-foreground">{c.access_code}</span>
                                  {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                      <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 border-t border-border/20 pt-4 mt-2">
                    <Button variant="outline" className="rounded-xl border-border/60 text-foreground hover:bg-accent" onClick={closeAddDialog}>{tc('cancel')}</Button>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm"
                      disabled={!selectedContractorId || isLinking}
                      onClick={handleLinkContractor}
                    >
                      {isLinking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('linking')}</> : t('linkToProject')}
                    </Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog> }
        </div>

        {/* Contractors List */}
        {contractors.length === 0 ? (
          <Card className="p-8 text-center border border-dashed border-neutral-300">
            <HardHat className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-4">{t('noContractorsYet')}</p>
          {projectEditPermission &&  <Button onClick={() => setIsAddOpen(true)} className="h-9 bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              {t('addContractor')}
            </Button>}
          </Card>
        ) : filteredContractors.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-neutral-500">{t('noSearchMatch')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredContractors.map(contractor => (
              <ContractorCard
                key={contractor.id}
                contractor={contractor}
                projectId={params.id}
                onCopyLink={handleCopyLink}
                onOpenPortal={handleOpenPortal}
                onRemoveShare={shareId => handleRemoveShare(contractor.id, shareId)}
                onMessage={() => setMessageContractor(contractor)}
                onShareFiles={() => setShareFilesContractor(contractor)}
                onProfile={() => setProfileContractor(contractor)}
                projectEditPermission={projectEditPermission}
                
              />
            ))}
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <ContractorMessageDialog
        contractor={messageContractor}
        open={!!messageContractor}
        onOpenChange={open => !open && setMessageContractor(null)}
        onMessageSent={async () => {
          // Refresh contractors to get updated messages
          refetch();
        }}
      />

      {/* Share Files Dialog */}
      {shareFilesContractor && (
        <ShareFilesDialog
          projectId={params.id}
          contractorId={shareFilesContractor.id}
          contractorName={shareFilesContractor.name}
          isOpen={!!shareFilesContractor}
          onClose={() => setShareFilesContractor(null)}
          alreadyShared={shareFilesContractor.shared_drawings}
          onShareComplete={async () => {
            // Refresh contractors to get updated data
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title={`Remove Shared ${deleteTarget?.type === 'item' ? 'Item' : 'Drawing'}`}
        description={`Are you sure you want to remove "${deleteTarget?.itemName}" from this contractor? They will no longer have access to this ${deleteTarget?.type === 'item' ? 'item' : 'drawing'}.`}
        itemName={deleteTarget?.itemName}
        requireConfirmation={false}
        confirmText="Remove"
        isDeleting={isDeletingProcurement || isDeletingDocument}
      />

      {/* Profile Drawer */}
      {profileContractor && (
        <ContractorProfileDrawer
          contractorId={profileContractor.id}
          isOpen={!!profileContractor}
          onClose={() => setProfileContractor(null)}
          onSaved={() => refetch()}
          projectId={params.id}
        />
      )}
    </div>
  );
}
