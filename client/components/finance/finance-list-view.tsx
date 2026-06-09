'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import { FileText, ShoppingCart, Plus, Search, Filter, MoreHorizontal, Trash2, ArrowUpDown, Eye, Download, Mail, Pencil, Send, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteDialog } from '@/components/DeleteDialog';
import useDeleteData from '@/hooks/useDelete';
import { usePost } from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { SendEmailDialog, EmailFormData } from '@/components/SendEmailDialog';
import useUser from '@/hooks/useUser';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { InvoicesOnboardingHero } from '@/components/finance/invoices-onboarding-hero';

export type FinanceListMode = 'all' | 'invoices' | 'purchase-orders';

type FinanceListViewProps = {
  mode?: FinanceListMode;
};

function modeToTypeFilter(mode: FinanceListMode): 'All' | 'PO' | 'Invoice' {
  if (mode === 'invoices') return 'Invoice';
  if (mode === 'purchase-orders') return 'PO';
  return 'All';
}

export function FinanceListView({ mode = 'all' }: FinanceListViewProps) {
  const t = useTranslations('financePage');
  const STATUS_OPTIONS = [
    { label: t('status.all'), value: 'All' },
    { label: t('status.draft'), value: 'DFT' },
    { label: t('status.sent'), value: 'SNT' },
    { label: t('status.approved'), value: 'APR' },
    { label: t('status.paid'), value: 'PD' },
    { label: t('status.overdue'), value: 'OVD' },
  ];

  const SORT_OPTIONS = [
    { label: t('sort.dateNewest'), value: 'date_desc' },
    { label: t('sort.dateOldest'), value: 'date_asc' },
    { label: t('sort.amountHigh'), value: 'amount_desc' },
    { label: t('sort.amountLow'), value: 'amount_asc' },
    { label: t('sort.dueNearest'), value: 'due_date_asc' },
    { label: t('sort.dueFarthest'), value: 'due_date_desc' },
  ];

  const { user } = useUser();
  const { currency, isLoading: currencyLoading } = useCurrency(user?.studio?.default_currency);
  const [checkedItems, setCheckedItems] = useState<any[]>([]);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<any>(null);
  const [isPo, setIsPo] = useState<boolean>(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const {can} = usePermissions()
  const financePermission = can('finance.edit')
  const financeDeletePermission = can('finance.delete')
  const { downloadPdf, isGenerating, generatingId } = usePdfDownload()

  const rawType = searchParams.get('type');
  const typeFilter: 'All' | 'PO' | 'Invoice' =
    mode !== 'all'
      ? modeToTypeFilter(mode)
      : rawType === 'PO' || rawType === 'Invoice'
        ? rawType
        : 'All';

  const setTypeFilter = (type: 'All' | 'PO' | 'Invoice') => {
    if (mode !== 'all') {
      if (type === 'Invoice') router.push('/finance/invoices');
      else if (type === 'PO') router.push('/finance/purchase-order');
      else router.push('/finance/invoices');
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'All') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  


  const {
    data: financeData,
    isLoading: financeLoading,
    refetch: financeRefetch,
  } = useFetch('finance/studio-finance/');

  const { mutate: deleteInvoice } = useDeleteData({
    onSuccess: () => {
      toast.success(t('toasts.invoiceDeleted'));
      financeRefetch();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });


  // ...

  const handleDelete = (id: any) => {
    if (!financeDeletePermission) {
      toast.error(t('toasts.noDeletePermission'));
      return;
    }
    if (isPo) {
      deletePO({ url: `finance/purchase-orders/${id}/` });
    } else {
      deleteInvoice({ url: `finance/invoices/${id}/` });
    }
  };



  const { mutate: sendEmail, isPending: isSendingEmail } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.emailSent'));
      setIsEmailDialogOpen(false);
    },
    onError: () => {
      toast.error(t('toasts.emailFailed'));
    },
  });

  const { mutate: sendEmailToClient, isPending: isSendingEmailToClient } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.emailSent'));
    },
    onError: () => {
      toast.error(t('toasts.emailFailed'));
    },
  });


  const openEmailDialog = (item: any) => {
    setSelectedItem(item);
    setIsEmailDialogOpen(true);
  };

  const handleSendEmailFromDialog = (emailData: EmailFormData) => {
    const hasAttachments = emailData.attachments && emailData.attachments.length > 0;
    
    let requestData: any;

    const basePayload = {
      cc_user_ids: emailData.bcc?.map(item => item.id) || [],
      html_content: emailData.message,
      project: typeof selectedItem.project === 'object' ? selectedItem.project.id : selectedItem.project,
      supplier: typeof selectedItem.supplier === 'object' ? selectedItem.supplier.id : selectedItem.supplier,
      status: selectedItem.status,
      date: selectedItem.date,
      due_date: selectedItem.due_date,
      currency: selectedItem.currency,
      studio: selectedItem.studio,
      line_items: selectedItem.line_items?.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      })) || []
    };

    if (hasAttachments) {
       const formData = new FormData();

       // Append simple fields
       formData.append('html_content', basePayload.html_content);
       if (basePayload.project) formData.append('project', String(basePayload.project));
       if (basePayload.supplier) formData.append('supplier', String(basePayload.supplier));
       if (basePayload.status) formData.append('status', basePayload.status);
       if (basePayload.date) formData.append('date', basePayload.date);
       if (basePayload.due_date) formData.append('due_date', basePayload.due_date);
       if (basePayload.currency) formData.append('currency', basePayload.currency);
       if (basePayload.studio) formData.append('studio', String(basePayload.studio));
       
       // Append CC users
       basePayload.cc_user_ids.forEach((id: any) => {
         formData.append('cc_user_ids', String(id));
       });

       // Append Line items as JSON string for safety in multipart
       formData.append('line_items', JSON.stringify(basePayload.line_items));

       // Append Attachments
       emailData.attachments?.forEach((file) => {
         formData.append('attachments', file);
       });
       
       requestData = formData;
    } else {
       requestData = basePayload;
    }

    sendEmail({
      url: `finance/purchase-orders/${selectedItem.id}/send-email/`,
      data: requestData
    });
  };

  const handleSendInvoice = (item: any) => {
    sendEmailToClient({
      url: `finance/invoices/${item?.id}/send-invoice/`,
      data: {
        id: item?.id,
      }
    });
  };

  const { mutate: sendReminder } = usePost({
    onSuccess: () => toast.success(t('reminderSent')),
    onError: () => toast.error(t('reminderFailed')),
  });

  const handleSendReminder = (item: any) => {
    sendReminder({
      url: `finance/invoices/${item?.id}/send-reminder/`,
      data: {},
    });
  };


  const safeIncludes = (value: any, search: string) =>
    typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase());

  const { filteredPurchaseOrders, filteredInvoices } = useMemo(() => {
    if (!financeData) return { filteredPurchaseOrders: [], filteredInvoices: [] };

    const lowerSearch = searchText.toLowerCase();
    const isAllStatus = statusFilter === 'All';

    // Sort function
    const sortItems = (items: any[]) => {
      return [...items].sort((a, b) => {
        switch (sortBy) {
          case 'date_desc':
            return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
          case 'date_asc':
            return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
          case 'amount_desc':
            return (parseFloat(b.total_amount) || 0) - (parseFloat(a.total_amount) || 0);
          case 'amount_asc':
            return (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0);
          case 'due_date_asc':
            return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
          case 'due_date_desc':
            return new Date(b.due_date || 0).getTime() - new Date(a.due_date || 0).getTime();
          default:
            return 0;
        }
      });
    };

    // Purchase Orders
    const pos = (financeData.purchase_orders || []).filter((po: any) => {
      const displayPo = po.display_po || '';
      const supplierName = po.supplier?.company_name || po.supplier?.name || '';
      const projectName = po.project?.project_name || '';

      const matchesSearch =
        !searchText ||
        safeIncludes(displayPo, lowerSearch) ||
        safeIncludes(supplierName, lowerSearch) ||
        safeIncludes(projectName, lowerSearch);

      const matchesStatus = isAllStatus || po.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Invoices
    const invs = (financeData.invoices || []).filter((inv: any) => {
      const displayInv = inv.display_invoice || '';
      const clientName = inv.client?.company_name || inv.client?.name || '';
      const projectName = inv.project?.project_name || '';

      const matchesSearch =
        !searchText ||
        safeIncludes(displayInv, lowerSearch) ||
        safeIncludes(clientName, lowerSearch) ||
        safeIncludes(projectName, lowerSearch);

      const matchesStatus = isAllStatus || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return {
      filteredPurchaseOrders: typeFilter === 'Invoice' ? [] : sortItems(pos),
      filteredInvoices: typeFilter === 'PO' ? [] : sortItems(invs),
    };
  }, [financeData, searchText, statusFilter, sortBy, typeFilter, financeLoading]);


  // Check all PO and Invoices
  const handleCheckAll = (checked: boolean) => {
    let allItems: any[] = [];
    if (filteredPurchaseOrders && Array.isArray(filteredPurchaseOrders)) {
      allItems = [...filteredPurchaseOrders];
    }
    if (filteredInvoices && Array.isArray(filteredInvoices)) {
      allItems = [...allItems, ...filteredInvoices];
    }
    setCheckedItems(checked ? allItems : []);
  };

  // Handle single item selection
  const handleChange = e => {
    const { value, checked } = e.target;
    setCheckedItems(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(item => item.id !== value.id);
      }
    });
  };

  // Check if selected items have invoices
  const hasInvoicesSelected = useMemo(() => {
    return checkedItems.some((item: any) => item.display_invoice);
  }, [checkedItems]);

  // Get only PO ids from checked items
  const selectedPoIds = useMemo(() => {
    return checkedItems
      .filter((item: any) => item.display_po)
      .map((item: any) => item.id);
  }, [checkedItems]);

  // Get only Invoice ids from checked items
  const selectedInvoiceIds = useMemo(() => {
    return checkedItems
      .filter((item: any) => item.display_invoice)
      .map((item: any) => item.id);
  }, [checkedItems]);

  const { mutate: createInvoiceFromPO, isPending: isCreatingInvoice } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.invoiceCreated'));
      setCheckedItems([]);
      financeRefetch();
      setButtonLoadingPO(false);
    },
    onError: (error: Error) => {
      toast.error(error.response.data.error || t('toasts.invoiceCreateFailed'));
      setButtonLoadingPO(false);
    },
  });

  const { mutate: bulkDeletePO, isPending: isDeletingPO } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.purchaseOrdersDeleted'));
      setCheckedItems([]);
      financeRefetch();
    },
    onError: (error: Error) => {
      toast.error(error.response.data.error || t('toasts.purchaseOrdersDeleteFailed'));
    },
  });

  const { mutate: bulkDeleteInvoice, isPending: isDeletingInvoice } = usePost({
    onSuccess: () => {
      toast.success(t('toasts.invoicesDeleted'));
      setCheckedItems([]);
      financeRefetch();
    },
    onError: (error: Error) => {
      toast.error(error.response.data.error || t('toasts.invoicesDeleteFailed'));
    },
  });

  // Handle Create Invoice
  const handleInvoice = () => {
    if (checkedItems?.length == 0) {
      router.push('/finance/invoices/new');
      return;
    }

    if (hasInvoicesSelected) {
      toast.error(t('toasts.cannotCreateFromInvoices'));
      return;
    }

    if (selectedPoIds.length > 0) {
      setButtonLoadingPO(true);
      createInvoiceFromPO({
        url: 'finance/create-invoice/create_invoice/',
        data: { po_ids: selectedPoIds }
      });
    }
  };

  // Handle Bulk Delete - Open confirmation dialog
  const handleBulkDelete = () => {
    if (checkedItems.length === 0) {
      toast.error(t('toasts.noItemsSelected'));
      return;
    }
    setIsBulkDeleteOpen(true);
  };

  // Confirm Bulk Delete - Actually perform deletion
  const confirmBulkDelete = () => {
    // Delete POs if any
    if (selectedPoIds.length > 0) {
      bulkDeletePO({
        url: 'finance/purchase-orders/bulk-delete/',
        data: { ids: selectedPoIds }
      });
    }

    // Delete Invoices if any
    if (selectedInvoiceIds.length > 0) {
      bulkDeleteInvoice({
        url: 'finance/invoices/bulk-delete/',
        data: { ids: selectedInvoiceIds }
      });
    }

    setIsBulkDeleteOpen(false);
  };


  // Calculate totals for stats
  let totalPurchaseOrder = 0;
  let totalInvoiceOrder = 0;

  (financeData?.invoices || []).forEach((item: any) => {
    const temp = parseFloat(item.total_amount) || 0;
    totalInvoiceOrder += temp;
  });


  (financeData?.purchase_orders || []).forEach((item: any) => {
    const temp = parseFloat(item.total_amount) || 0;
    totalPurchaseOrder += temp;
  });

  const financeStats = [
    {
      title: t('stats.totalInvoices'),
      value: `${currency?.symbol}${((totalInvoiceOrder || 0)).toLocaleString('en-GB', {
        maximumFractionDigits: 2,
      })}`,

      subtitle: `${(financeData?.invoices?.length || 0)} ${t('stats.invoices')}`,
      icon: FileText,
    },

    {
      title: t('stats.totalPurchaseOrders'),
      value: `${currency?.symbol}${(totalPurchaseOrder || 0).toLocaleString('en-GB', {
        maximumFractionDigits: 2,
      })}`,
      subtitle: `${financeData?.purchase_orders?.length || 0} ${t('stats.purchaseOrders')}`,
      icon: ShoppingCart,
    },
  ];

  const showInvoicesOnboarding =
    mode === 'invoices' && !financeLoading && filteredInvoices.length === 0 && !searchText && statusFilter === 'All';

  const latestDraftInvoice = useMemo(() => {
    const drafts = (financeData?.invoices || []).filter((inv: any) => inv.status === 'DFT');
    if (!drafts.length) return null;
    return drafts.sort((a: any, b: any) => new Date(b.updated_at || b.date || 0).getTime() - new Date(a.updated_at || a.date || 0).getTime())[0];
  }, [financeData]);

  useEffect(() => {
    const titles: Record<FinanceListMode, string> = {
      all: 'Finance',
      invoices: 'Invoices',
      'purchase-orders': 'Purchase Orders',
    };
    document.title = `${titles[mode]} | Focuspilot`;
  }, [mode]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PD': // Paid
        return 'bg-[#A8E2EC] text-[#2C96A8] border-[#7FCEDC]'; // slightly darker

      case 'DFT': // Draft
      case 'NE': // New
        return 'bg-orange-100 text-orange-900 border-orange-300'; // darker

      case 'SNT': // Sent
        return 'bg-[#DAEAFD] text-[#3556BB] border-[#B5D4F9]';

      case 'APR': // Approved
      case 'RCV': // Received
        return 'bg-[#C5E7D9] text-green-900 border-[#98D2BD]';

      case 'OVD': // Overdue
        return 'bg-red-100 text-red-900 border-red-300';

      default:
        return 'bg-stone-100 text-gray-700 border-gray-300';
    }
  };


  const { mutate: deletePO } = useDeleteData({
    onSuccess: () => {
      toast.success(t('toasts.poDeleted'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openDeleteModal = (po: any, tag: any) => {
    setIsDeleteOpen(true);
    setSelectedPo(po);
    if (tag == 'po') {
      setIsPo(true);
    } else {
      setIsPo(false);
    }
  };


  const handleOpenPO = (id: string | number) => {
    downloadPdf(id, 'po').catch(() => toast.error(t('toasts.pdfFailed')));
  };

  const handleOpenInvoice = (id: string | number) => {
    downloadPdf(id, 'invoice').catch(() => toast.error(t('toasts.pdfFailed')));
  };


  // console.log("filteredPurchaseOrders", filteredPurchaseOrders);



  return (
    <div
      className={cn(
        'flex flex-col bg-background p-4 sm:p-6',
        showInvoicesOnboarding ? 'h-auto' : 'h-[calc(100svh-3.5rem)] min-h-0',
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-7xl flex flex-col',
          showInvoicesOnboarding
            ? ''
            : 'min-h-0 flex-1 animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500',
        )}
      >

        {mode === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financeStats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showInvoicesOnboarding && (
          <InvoicesOnboardingHero canEdit={financePermission} draftInvoice={latestDraftInvoice} />
        )}

        {!showInvoicesOnboarding && (
        <div className="flex items-center flex-wrap justify-center lg:justify-between gap-3">
          {mode === 'all' && (
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            {(['All', 'PO', 'Invoice'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`relative px-3 py-1.5 text-sm rounded-md transition-colors ${
                  typeFilter === type
                    ? 'text-neutral-900 font-medium'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {typeFilter === type && (
                  <motion.div
                    layoutId="finance-tab-pill"
                    className="absolute inset-0 bg-white rounded-md shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {type === 'All' ? t('tabs.all') : type === 'PO' ? t('tabs.purchaseOrders') : t('tabs.invoices')}
                </span>
              </button>
            ))}
          </div>
          )}

          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 26 }} className="flex justify-center lg:justify-start items-center gap-2 flex-wrap ml-auto">
            <motion.div layout className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " />
              <Input
                placeholder={t('searchPlaceholder')}
                className="pl-10 w-56"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                aria-label={t('searchAria')}
              />
            </motion.div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='h-10' variant="outline" size='sm'>
                  <Filter className="w-4 h-4 mr-2" />
                  {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || t('filter')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {STATUS_OPTIONS.map(status => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={statusFilter === status.value ? 'font-semibold text-black' : ''}
                  >
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='h-10' variant="outline" size='sm'>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || t('sortLabel')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? 'font-semibold text-black' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {financePermission && mode !== 'purchase-orders' && (
              <motion.div layout>
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  onClick={handleInvoice}
                  disabled={buttonLoadingPO || hasInvoicesSelected}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {buttonLoadingPO ? t('creating') : t('createInvoice')}
                </Button>
              </motion.div>
            )}
            {financePermission && mode === 'purchase-orders' && (
              <motion.div layout>
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => router.push('/finance/purchase-order/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newPurchaseOrder')}
                </Button>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout">
              {checkedItems.length > 0 && financeDeletePermission&& (
                <motion.div
                  key="delete"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isDeletingPO || isDeletingInvoice}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {(isDeletingPO || isDeletingInvoice) ? t('deleting') : t('delete')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        )}

        {!showInvoicesOnboarding && !financeLoading && filteredPurchaseOrders.length === 0 && filteredInvoices.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 " />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{searchText ? `${t('noResultsFor')} "${searchText}"` : t('nothingYet')}</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              {t('emptyDescription')}
            </p>
            <div className="flex gap-3">
              {/* <Button onClick={() => router.push('/finance/purchase-order/new')} className="bg-clay-500 hover:bg-clay-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New PO
              </Button> */}
           {financePermission &&   <Button className="bg-clay-500 hover:bg-clay-600 text-white" onClick={() => router.push('/finance/invoices/new')} >
                <Plus className="w-4 h-4 mr-2" />
                {t('newInvoice')}
              </Button>}
            </div>
          </div>
        ) : !showInvoicesOnboarding ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar scrollbar-thin">
              <table className="w-full table-fixed" style={{ minWidth: '1040px' }}>
                {/* Sticky header, Title Case, no ALL CAPS */}
                <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left w-12">
                      <span className="sr-only">{'Select row'}</span>
                      <Checkbox
                      disabled={!financePermission}
                        checked={checkedItems.length > 0 && checkedItems.length === (filteredPurchaseOrders.length + filteredInvoices.length)}
                        onCheckedChange={handleCheckAll}
                      />
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-28">{t('table.number')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-48">{t('table.supplierClient')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-16">{t('table.type')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-40">{t('table.project')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('table.dateIssued')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('table.dueDate')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('table.amount')}</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-24">{t('table.status')}</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-28">{t('table.invoiceReference')}</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-28">{t('table.sync')}</th>
                    <th className="pl-3 pr-6 py-3 text-right text-sm font-medium text-gray-600 whitespace-nowrap w-24">{t('table.actions')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  {(financeLoading) &&
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index} className="hover:bg-stone-50">
                        <td className="px-3 py-3">
                          <div className="w-5 h-5 bg-stone-200 rounded border animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-24 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-32 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-20 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-20 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-20 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-16 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-16 h-4 bg-stone-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-2 pr-4 py-3 text-right">
                          <div className="w-16 h-4 bg-stone-200 rounded animate-pulse ml-auto"></div>
                        </td>
                        <td className="px-2 pr-4 py-3 text-right">
                          <div className="w-16 h-4 bg-stone-200 rounded animate-pulse ml-auto"></div>
                        </td>
                        <td className="px-2 pr-4 py-3 text-right">
                          <div className="w-16 h-4 bg-stone-200 rounded animate-pulse ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  <>
                    {!financeLoading &&
                      filteredPurchaseOrders.map((po: any) => (
                        <tr key={po.display_po} className="hover:bg-stone-50">
                          <td className="px-3 py-3">
                            <Checkbox
                              checked={checkedItems.some(item =>
                                (item.display_po === po.display_po)
                              )}
                              onCheckedChange={checked => handleChange({ target: { value: po, checked } })}
                              aria-label={`Select ${po?.id}`}
                              disabled={!financePermission}
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <Link className="hover:underline" href={`/finance/purchase-order/${po.id}`}>
                              {po.display_po}
                            </Link>
                          </td>
                          <td className="px-3 truncate py-3 text-gray-600 whitespace-nowrap">
                            {po.supplier?.company_name || po.supplier?.name || '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">PO</td>
                          <td className="px-3 py-3 text-gray-600 truncate whitespace-nowrap">
                            {po.project?.project_name || '—'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                            {po.date ? new Date(po.date).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                            {po.due_date ? new Date(po.due_date).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {/* {po.currency || 'USD'} */}
                            <ViewCurrencySymbol code={po.currency || 'USD'} />
                            {Number(po.total_amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={po.status} label={STATUS_OPTIONS.find(o => o.value === po.status)?.label || po.status} className={getStatusStyle(po.status)} />
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                            {po.inv_ref && po.inv_ref.length > 0
                              ? po.inv_ref.map((ref: number) => `INV-${String(ref).padStart(3, '0')}`).join(', ')
                              : '-'}
                          </td>

                          <td className="px-2 text-center py-3">

                            <span
                              className={`rounded-2xl font-medium text-xs py-1 h-auto px-3 ${po?.xero_sync ? 'bg-sage-300 text-olive-600 border border-sage-500' : 'bg-red-100 text-red-800 border border-red-300'}`}

                            >
                              {po?.xero_sync ? 'Synced' : 'Not Synced'}
                            </span>
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label={`Actions for ${po.poNumber}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link className="flex items-center gap-2" href={`/finance/purchase-order/${po.id}`}>
                                    <Eye className="w-4 h-4 " /> View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenPO(po.id)} className="flex items-center gap-2" disabled={isGenerating && generatingId === po.id}>
                                  {isGenerating && generatingId === po.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                  {isGenerating && generatingId === po.id ? 'Generating...' : 'Download PDF'}
                                </DropdownMenuItem>
                                {financePermission && (
                                  <DropdownMenuItem onClick={() => openEmailDialog(po)} className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 " /> Send to Supplier
                                  </DropdownMenuItem>
                                )}
                                {financePermission && (
                                  <DropdownMenuItem asChild>
                                    <Link className="flex items-center gap-2" href={`/finance/purchase-order/${po.id}`}>
                                      <Pencil className="w-4 h-4 " /> Edit
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {financeDeletePermission && <DropdownMenuSeparator />}
                                {financeDeletePermission && (
                                  <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600" onClick={() => openDeleteModal(po, 'po')}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                      </tr>
                      ))}

                    {!customLoading &&
                      filteredInvoices.map((inv: any) => (
                        <tr key={inv.display_invoice} className="hover:bg-stone-50">
                          <td className="px-3 py-3">
                            <Checkbox
                            disabled={!financePermission}
                              checked={checkedItems.some(item =>
                                (item.display_invoice === inv.display_invoice)
                              )}
                              onCheckedChange={checked => handleChange({ target: { value: inv, checked } })}
                              aria-label={`Select ${inv.id}`}
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <Link className="hover:underline" href={`/finance/invoices/${inv.id}`}>
                              {inv.display_invoice}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-gray-600 truncate whitespace-nowrap">
                            {inv.client?.company_name || inv.client?.name || '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">Inv</td>
                          <td className="px-3 py-3 text-gray-600 truncate whitespace-nowrap">
                            {inv.project?.project_name || '—'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                            {inv.date ? new Date(inv.date).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <ViewCurrencySymbol code={inv.currency || 'USD'} />
                            {Number(inv.total_amount).toLocaleString('en-US', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={inv.status} label={STATUS_OPTIONS.find(o => o.value === inv.status)?.label || inv.status} className={getStatusStyle(inv.status)} />
                          </td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                           -
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`rounded-2xl font-medium text-xs py-1 h-auto px-3 ${inv?.xero_sync ? 'bg-sage-300 text-olive-600 border border-sage-500' : 'bg-red-100 text-red-800 border border-red-300'}`}

                            >
                              {inv?.xero_sync ? 'Synced' : 'Not Synced'}
                            </span>
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label={`Actions for ${inv.display_invoice}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link className="flex items-center gap-2" href={`/finance/invoices/${inv.id}`}>
                                    <Eye className="w-4 h-4 " /> View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenInvoice(inv.id)} className="flex items-center gap-2" disabled={isGenerating && generatingId === inv.id}>
                                  {isGenerating && generatingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                  {isGenerating && generatingId === inv.id ? 'Generating...' : 'Download PDF'}
                                </DropdownMenuItem>
                                {financePermission && (
                                  <DropdownMenuItem onClick={() => handleSendInvoice(inv)} className="flex items-center gap-2">
                                    <Send className="w-4 h-4 " /> Send to Client
                                  </DropdownMenuItem>
                                )}
                                {financePermission && (inv.status === 'SNT' || inv.status === 'OVD') && (
                                  <DropdownMenuItem onClick={() => handleSendReminder(inv)} className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 " /> {t('sendReminder')}
                                  </DropdownMenuItem>
                                )}
                                {financePermission && (
                                  <DropdownMenuItem asChild>
                                    <Link className="flex items-center gap-2" href={`/finance/invoices/${inv.id}`}>
                                      <Pencil className="w-4 h-4 " /> Edit
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {financeDeletePermission && <DropdownMenuSeparator />}
                              {financeDeletePermission && (
                                  <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600" onClick={() => openDeleteModal(inv, 'inv')}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                  </>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedPo?.id)}
        title="Delete PO/IN?"
        description="Are you sure you want to delete this? This action cannot be undone."
        itemName={isPo ? selectedPo?.display_po : selectedPo?.display_invoice}
        requireConfirmation={false}
      />

      <DeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Items?"
        description={`Are you sure you want to delete ${checkedItems.length} selected item${checkedItems.length > 1 ? 's' : ''}? This action cannot be undone.`}
        itemName={`${selectedPoIds.length > 0 ? `${selectedPoIds.length} PO${selectedPoIds.length > 1 ? 's' : ''}` : ''}${selectedPoIds.length > 0 && selectedInvoiceIds.length > 0 ? ' and ' : ''}${selectedInvoiceIds.length > 0 ? `${selectedInvoiceIds.length} Invoice${selectedInvoiceIds.length > 1 ? 's' : ''}` : ''}`}
        requireConfirmation={false}
      />

      <SendEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        onSend={handleSendEmailFromDialog}
        title="Send Email"
        description={`Send an email for ${selectedItem?.display_po || selectedItem?.display_invoice || 'this item'}`}
        selectedItem={selectedItem}
        isSendingEmail={isSendingEmail}
      />
    </div>
  );
}
