'use client';

import { useCallback, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal, Trash2, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CrmNav } from '@/components/crm-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TypeChip } from '@/components/chip';
import { useQueryClient } from '@tanstack/react-query';
import { ContactDetailSheet } from '@/components/contact-details';
import { ContactFormModal } from '@/components/create-contact-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteDialog } from '@/components/DeleteDialog';
import { gooeyToast as toast } from 'goey-toast';
import React from 'react';
import useFetch from '@/hooks/useFetch';
import useDeleteData from '@/hooks/useDelete';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useEditGuard } from '@/hooks/useEditGuard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useContactsStore } from '@/store/useContactsStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { gooeyToast } from 'goey-toast';
import { useTranslations } from 'next-intl';

const ContactRow = React.memo(function ContactRow({
  contact,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
  clientsPermission,
  clientsDeletePermission
}: {
  contact: any;
  onView: (c: any) => void;
  onEdit: (c: any) => void;
  onDelete: (c: any) => void;
  isSelected: boolean;
  onToggleSelect: (contact: any, checked: boolean) => void;
  clientsPermission: boolean;
  clientsDeletePermission: boolean;
}) {
  const t = useTranslations('crmContactsPage');
  const tc = useTranslations('common');
  const router = useRouter();

  return (
    <tr key={contact.id} onClick={() => router.push(`/crm/contacts/${contact.id}`)} className="hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/20 text-foreground">
      <td className="px-4 py-3">
        <span onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
          <Checkbox disabled={!clientsPermission} checked={isSelected} onCheckedChange={checked => onToggleSelect(contact, checked as boolean)} />
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {contact?.name ? contact.name[0] : contact?.company?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate" title={contact?.name}>
              {contact?.name}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={contact?.company_name}>
              {contact?.company_name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap truncate" title={contact?.email || tc('notAvailable')}>
            {contact?.email ? <>
              <Mail className="w-4 h-4 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{contact?.email}</span></> : '-'}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap truncate" title={contact?.phone || tc('notAvailable')}>
            {contact?.phone ? <>
              <Phone className="w-4 h-4 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{contact?.phone}</span></> : '-'}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <TypeChip label={contact?.type} />
      </td>
      <td className="pl-4 pr-6 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              aria-label={`Open actions for ${contact?.name}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              router.push(`/crm/contacts/${contact.id}`);
            }}>{t('viewProfile')}</DropdownMenuItem>

        {clientsPermission &&    <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onEdit(contact);
              }}
            >
              {t('editContact')}
            </DropdownMenuItem>}
           {clientsDeletePermission &&  <DropdownMenuSeparator />}
         {clientsDeletePermission &&   <DropdownMenuItem
              className="text-red-600"
              onClick={e => {
                e.stopPropagation();
                onDelete(contact);
              }}
            >
              {tc('delete')}
            </DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});

const PAGE_SIZE = 10;

const contactTypeMap: Record<string, string> = {
  clients: 'CL',
  suppliers: 'SP',
  contractors: 'CN',
};

function ContactsPageContent() {
  const t = useTranslations('crmContactsPage');
  const tc = useTranslations('common');

  const mapContactType = (type: string) => {
    switch (type) {
      case 'CL':
        return tc('client');
      case 'SP':
        return tc('supplier');
      case 'CN':
        return tc('contractor');
      default:
        return type;
    }
  };

  const {
  selectedContact,
  checkedItems,
  sheetOpen,
  contactModalOpen,
  isDeleteOpen,
  isBulkDeleteOpen,
  openSheet,
  openContactModal,
  openDeleteModal,
  closeAllModals,
  toggleSelect,
  selectAll,
  clearSelection,
  openBulkDelete,
} = useContactsStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const tabMap: Record<string, string> = { clients: 'clients', suppliers: 'suppliers', contractors: 'contractors' };
  const activeTab = tabMap[searchParams.get('tab') || ''] || 'all';
  const searchTerm = searchParams.get('search') || '';

  // Local input state — debounced before writing to URL
  const [inputValue, setInputValue] = React.useState(searchTerm);

  // Keep inputValue in sync if URL search changes externally (browser back/fwd)
  useEffect(() => { setInputValue(searchTerm); }, [searchTerm]);

  const updateUrl = (patch: { page?: number; tab?: string; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const page = patch.page ?? urlPage;
    const tab = patch.tab ?? activeTab;
    const search = patch.search !== undefined ? patch.search : searchTerm;
    if (page <= 1) params.delete('page'); else params.set('page', String(page));
    if (tab === 'all') params.delete('tab'); else params.set('tab', tab);
    if (!search) params.delete('search'); else params.set('search', search);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Debounce: write inputValue → URL after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchTerm) {
        updateUrl({ search: inputValue, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Clear selection when tab changes
  useEffect(() => { clearSelection(); }, [activeTab]);

  const contactFilters = [
    { label: tc('all'), val: 'all' },
    { label: tc('clients'), val: 'clients' },
    { label: tc('suppliers'), val: 'suppliers' },
    { label: tc('contractors'), val: 'contractors' },
  ];
  const queryClient = useQueryClient();
  const { guard } = useEditGuard('clients.edit');
  const {can} = usePermissions();
  const clientsPermission = can('clients.edit');
  const clientsDeletePermission = can('clients.delete');

  // Build query string for API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set('page', urlPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (activeTab !== 'all') params.set('contact_type', contactTypeMap[activeTab]);
    return `crm/studio-contacts/?${params.toString()}`;
  };

  const queryUrl = buildQueryString();
  const { data: contactData, isLoading, refetch, isFetching } = useFetch(queryUrl);

  useEffect(() => {
    document.title = 'Contacts | Focuspilot';
  }, []);

  // Map contact data from API response
  const contacts =
    contactData?.results?.map((contact: any) => ({
      ...contact,
      type: mapContactType(contact.contact_type),
    })) || [];

  const totalCount = contactData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 🪝 Stable callbacks (memoized)
  // const handleOpenSheet = useCallback((contact: any) => {
  //   setSheetOpen(true);
  //   setSelected(contact);
  // }, []);

  // const handleOpenContactForm = useCallback((contact: any) => {
  //   setContactModalOpen(true);
  //   setSelected(contact);
  // }, []);


  const { mutate } = useDeleteData({
    onSuccess: () => {
      gooeyToast.success(t('toasts.contactDeleted'));
      refetch();
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
    },
    onError: () => {
      toast(t('toasts.deleteFailed'));
    },
  });

  const handleDelete = useCallback(
    guard((id: string) => {
      mutate({ url: `crm/clients/${id}/` });
    }),
    [guard, mutate],
  );

  const { mutate: bulkDeleteContacts, isPending: isDeletingContacts } = useDeleteData({
    onSuccess: () => {
      toast.success(t('toasts.bulkDeleted'));
      clearSelection();
      refetch();
      queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
      queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toasts.bulkDeleteFailed'));
    },
  });

const handleCheckAll = (checked: boolean) => {
  checked ? selectAll(contacts) : clearSelection();
};

  const handleBulkDelete = () => {
    if(!clientsDeletePermission){
      toast.error(tc('noPermissionDelete'))
      return;
    }
    if (checkedItems.length === 0) return;
    openBulkDelete();
  };

  const confirmBulkDelete = () => {
    if(!clientsDeletePermission){
      toast.error(tc('noPermissionDelete'))
      return;
    }
    const ids = checkedItems.map(c => c.id);
    bulkDeleteContacts({
      url: 'crm/clients/bulk_delete/',
      data: { ids },
    });
    closeAllModals();
  };
 

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0 space-y-6">
        <CrmNav />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-xl border border-border/60 bg-background text-foreground text-[13px] hover:bg-muted/40 hover:border-primary/30 focus:ring-0 focus:outline-none transition-colors">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground/60" />
                  {activeTab === 'all'
                    ? tc('filter')
                    : activeTab === 'clients'
                      ? tc('clients')
                      : activeTab === 'suppliers'
                        ? tc('suppliers')
                        : tc('contractors')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {contactFilters.map(({ label, val }) => (
                    <DropdownMenuItem
                      key={val}
                      onClick={() => updateUrl({ tab: val, page: 1 })}
                      className={activeTab === val ? 'font-semibold text-black' : ''}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="pl-10 h-9 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
              {(isFetching || inputValue !== searchTerm) && (
                <Loader2 className="absolute right-3 h-4 w-4 top-2.5 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {clientsPermission && <motion.div
              layout
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              <Button
                onClick={() => openContactModal(null)}
                className="bg-primary text-primary-foreground hover:opacity-90 h-9 px-4 rounded-xl shadow-sm font-semibold transition-all gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('addContact')}
              </Button>
            </motion.div> }
            <AnimatePresence mode="popLayout">
              {checkedItems.length > 0 && clientsDeletePermission && (
                <motion.div
                  key="delete"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeletingContacts}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeletingContacts ? tc('deleting') : tc('delete')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-card animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl shadow-sm border border-border/40 overflow-hidden">
          <div className="overflow-x-auto scrollbar scrollbar-thin">
            <table className="w-full table-fixed">
              <thead className="bg-card border-b border-border/40 sticky top-0 z-10">
                <tr>
                  <th className="px-4 text-left text-sm font-medium text-muted-foreground" style={{ width: 48 }}>
                    <Checkbox
                    disabled={!clientsPermission}
                      checked={checkedItems.length > 0 && checkedItems.length === contacts.length}
                      onCheckedChange={handleCheckAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground" style={{ width: 320 }}>
                    {t('contactColumn')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground" style={{ width: 360 }}>
                    {t('contactInfoColumn')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground" style={{ width: 140 }}>
                    {tc('type')}
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-semibold text-muted-foreground" style={{ width: 96 }}>
                    {tc('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {!isLoading && contacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center shadow-sm text-muted-foreground">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t('emptyTitle')}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('emptySubtitle')}</p>
                        </div>
                        <Button
                          onClick={() => openContactModal()}
                          className="mt-2 bg-primary text-primary-foreground hover:opacity-90 h-9 px-4 rounded-xl shadow-sm font-semibold transition-all gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addContact')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  contacts.map((contact: any) => (
                   <ContactRow
  contact={contact}
  onView={openSheet}
  onEdit={guard(openContactModal)}
  onDelete={guard(openDeleteModal)}
  isSelected={checkedItems.some(item => item.id === contact.id)}
  onToggleSelect={toggleSelect}
  clientsPermission={clientsPermission}
  clientsDeletePermission={clientsDeletePermission}
  
/>

                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              {/* <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} contacts
              </p> */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => updateUrl({ page: Math.max(1, urlPage - 1) })}
                      className={urlPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {/* Page window: always show 5 pages centred on current */}
                  {(() => {
                    const delta = 2;
                    const start = Math.max(2, urlPage - delta);
                    const end = Math.min(totalPages - 1, urlPage + delta);
                    const pages: (number | 'ellipsis')[] = [];

                    // Always show page 1
                    pages.push(1);
                    if (start > 2) pages.push('ellipsis');
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (end < totalPages - 1) pages.push('ellipsis');
                    if (totalPages > 1) pages.push(totalPages);

                    return pages.map((page, idx) =>
                      page === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === urlPage}
                            onClick={() => page !== urlPage && updateUrl({ page })}
                            className={page === urlPage ? 'cursor-default' : 'cursor-pointer'}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    );
                  })()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => updateUrl({ page: Math.min(totalPages, urlPage + 1) })}
                      className={urlPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <ContactDetailSheet
  open={sheetOpen}
  onOpenChange={closeAllModals}
  contact={selectedContact}
/>

      <ContactFormModal refetch={refetch} open={contactModalOpen} onOpenChange={closeAllModals} contact={selectedContact} />
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => closeAllModals()}
        onConfirm={() => handleDelete(selectedContact?.id)}
        title={t('deleteContactTitle')}
        description={t('deleteContactDescription')}
        itemName={selectedContact?.name}
        requireConfirmation={false}
      />
      <DeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => closeAllModals()}
        onConfirm={confirmBulkDelete}
        title={t('deleteSelectedTitle')}
        description={t('deleteSelectedDescription', { count: checkedItems.length })}
        itemName={`${checkedItems.length} ${checkedItems.length > 1 ? tc('contacts') : tc('contact')}`}
        requireConfirmation={false}
      />
    </div>
  );
}

export default function ContactsPage() {
  return (
    <PermissionGuard permission="clients.view">
      <ContactsPageContent />
    </PermissionGuard>
  );
}
