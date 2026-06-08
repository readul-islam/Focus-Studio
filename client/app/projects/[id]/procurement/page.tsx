'use client';

import { useState, useMemo, useEffect, useTransition, useRef } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Layers,
  ClipboardCheck,
  DollarSign,
  Truck,
  Search,
  Loader2,
  ChevronDown,
  Info,
  X,
  EyeOff,
  Eye,
  ArrowLeft,
  Share2,
  SlidersHorizontal,
  Trash2,
  Download,
  Store,
} from 'lucide-react';
import { CatalogBrowseDialog } from '@/components/catalog/CatalogBrowseDialog';
import {
  getProcurementProductName,
  getProcurementSupplierName,
  getProcurementUnitPrice,
} from '@/lib/procurement-product';
import { ProductDetailSheet, type ProductDetails } from '@/components/product-detail-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { Switch } from '@/components/ui/switch';
import ProcurementTable from '@/components/project/ProcurementTable';
import { ProcurementInsights } from '@/components/ai/ProcurementInsights';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { useDebounce } from '@/hooks/useDebounce';
import { SelectContractorDialog } from '@/components/contractor';
import { Users } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';

function ProjectProcurementPageContent({ params }: { params: { id: string } }) {
  const t = useTranslations('projectProcurementPage');

  const logisticsLabels = {
    all: t('logistics.all'),
    Draft: t('logistics.draft'),
    Quoting: t('logistics.quoting'),
    'Internal Review': t('logistics.internalReview'),
    'Out of Stock': t('logistics.outOfStock'),
    'Client Review': t('logistics.clientReview'),
    'Payment Due': t('logistics.paymentDue'),
    Ordered: t('logistics.ordered'),
    'In Transit': t('logistics.inTransit'),
    Delivered: t('logistics.delivered'),
    Installed: t('logistics.installed'),
    'Internally Approved': t('logistics.internallyApproved'),
  };

  const logisticStatusLabels: Record<string, string> = {
    all: t('logisticStatus.all'),
    IT: t('logisticStatus.inTransit'),
    DD: t('logisticStatus.delivered'),
    NO: t('logisticStatus.notOrdered'),
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const shareWithContractor = searchParams.get('shareWith');
  const contractorName = searchParams.get('contractorName');

  const [checkedItems, setCheckedItems] = useState<any[]>([]);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const [isSharingItems, setIsSharingItems] = useState(false);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { can } = usePermissions()
  const procurementPermission = can('projects.edit');
  const procurementDeletePermission = can('projects.delete');
  const financePermission = can('finance.edit');

  useEffect(() => {
    const paid = searchParams.get('supplier_paid');
    if (paid === '1') {
      toast.success('Supplier payment completed.');
      queryClient.invalidateQueries({
        queryKey: [`projects/project-procurements/?project_id=${params.id}`],
      });
      router.replace(`/projects/${params.id}/procurement`, { scroll: false });
    } else if (paid === '0') {
      toast.message('Supplier payment was cancelled.');
      router.replace(`/projects/${params.id}/procurement`, { scroll: false });
    }
  }, [searchParams, params.id, queryClient, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input when 'f' is pressed, if not already in an input
      if (
        e.key === 'f' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const debouncedSearchText = useDebounce(searchInput, 500);
  const [isPending, startTransition] = useTransition();
  const [showTip, setShowTip] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [needsActionActive, setNeedsActionActive] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [poStatusFilter, setPOStatusFilter] = useState('all');
  const [billingFilter, setBillingFilter] = useState('all');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [logisticsFilter, setLogisticsFilter] = useState('all');
  const [logisticStatusFilter, setLogisticStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const updateFilter = (setter: any) => (value: any) => {
    startTransition(() => {
      setter(value);
    });
  };
  const [buttonLoadingInvoice, setButtonLoadingInvoice] = useState(false);
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);
  const [buttonLoadingDelete, setButtonLoadingDelete] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch procurement items from new API
  const {
    data: procurementItems,
    isLoading,
    error,
  } = useFetch(params?.id ? `projects/project-procurements/?project_id=${params.id}` : null, {
    enabled: !!params?.id,
  });
  const { data: projectData, isLoading: projectLoading } = useFetch(`projects/projects/${params?.id}/`, {
    enabled: !!params?.id,
  });

  const { currency } = useCurrency(projectData?.currency);
  const { mutate } = usePost();

  // Bulk share mutation
  const { mutate: bulkShareMutate } = usePost({
    onSuccess: () => {
      toast.success(
        t('itemsShared', {
          count: checkedItems.length,
          name: contractorName ? decodeURIComponent(contractorName) : t('itemsSharedContractor'),
        })
      );
      setCheckedItems([]);
      setIsSharingItems(false);
      queryClient.refetchQueries({
        queryKey: [`contractor_portal/project/${params.id}/contractors/`],
      });
      router.push(`/projects/${params.id}/contractors`);
    },
    onError: (error: any) => {
      toast.error(error?.message || t('shareFailed'));
      setIsSharingItems(false);
    },
  });

  const handleBulkShare = () => {
    if (!shareWithContractor || checkedItems.length === 0) return;

    setIsSharingItems(true);
    bulkShareMutate({
      url: 'contractor_portal/bulk-share-procurements/',
      data: {
        contractor_id: parseInt(shareWithContractor),
        procurement_ids: checkedItems.map(item => item.id),
      },
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem(`procurement-filters-${params.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNeedsActionActive(parsed.needsAction || false);
      setRoomFilter(parsed.room || 'all');
      setSupplierFilter(parsed.supplier || 'all');
      setApprovalFilter(parsed.approval || 'all');
      setPOStatusFilter(parsed.poStatus || 'all');
      setBillingFilter(parsed.billing || 'all');
      setSampleFilter(parsed.sample || 'all');
      setLogisticsFilter(parsed.logistics || 'all');
      setDateFilter(parsed.date || 'all');
    }
  }, [params.id]);

  const saveFilter = () => {
    const filters = {
      needsAction: needsActionActive,
      room: roomFilter,
      supplier: supplierFilter,
      approval: approvalFilter,
      poStatus: poStatusFilter,
      billing: billingFilter,
      sample: sampleFilter,
      logistics: logisticsFilter,
      date: dateFilter,
    };
    localStorage.setItem(`procurement-filters-${params.id}`, JSON.stringify(filters));
    toast.success(t('filtersSaved'));
  };

  // Filter procurement items based on all active filters
  const filteredItems = useMemo(() => {
    if (!procurementItems || !Array.isArray(procurementItems)) return [];

    const searchLower = debouncedSearchText.trim().toLowerCase();

    return procurementItems.filter(item => {
      if (searchLower) {
        const productName = getProcurementProductName(item).toLowerCase();
        const supplierName = getProcurementSupplierName(item).toLowerCase();
        if (!productName.includes(searchLower) && !supplierName.includes(searchLower)) {
          return false;
        }
      }

      if (roomFilter !== 'all' && item.room?.name?.trim().toLowerCase() !== roomFilter.trim().toLowerCase()) {
        return false;
      }

      if (supplierFilter !== 'all') {
        if (getProcurementSupplierName(item).trim().toLowerCase() !== supplierFilter.trim().toLowerCase()) {
          return false;
        }
      }

      if (approvalFilter !== 'all') {
        const filter = approvalFilter.toUpperCase();

        if (filter === 'RVW') {
          if (item.client_approval !== 'RVW' && item.client_approval !== null) {
            return false;
          }
        } else {
          if (item.client_approval !== filter) {
            return false;
          }
        }
      }

      if (sampleFilter !== 'all') {
        const sampleMap: Record<string, string | null> = {
          requested: 'REQ',
          received: 'REC',
          submitted: 'SUB',
          'not requested': null,
        };

        const selectedSample = sampleMap[sampleFilter.toLowerCase()];

        if (selectedSample === null) {
          // NOT_REQUIRED → show only null samples
          if (item.sample !== null) {
            return false;
          }
        } else if (selectedSample) {
          if (item.sample !== selectedSample) {
            return false;
          }
        }
      }

      if (logisticsFilter !== 'all') {
        const statusMap = {
          quoting: 'QT',
          'internal review': 'IR',
          'out of stock': 'OS',
          'client review': 'CR',
          ordered: 'ORD',
          'payment due': 'PD',
          'in transit': 'IT',
          installed: 'INS',
          delivered: 'DEL',
          'internally approved': 'IA',
        };
        const filterCode = statusMap[logisticsFilter.toLowerCase()];
        if (filterCode && item.status !== filterCode) {
          return false;
        }
      }

      // if (logisticStatusFilter !== 'all') {
      //           if (item.logistic_status !== logisticStatusFilter) {
      //     return false;
      //   }
      // }
      
      if (logisticStatusFilter !== 'all') {
  if (item.logistic_status !== logisticStatusFilter) {
    return false;
  }

  // Extra rule for IT
  if (
    logisticStatusFilter === 'IT' &&
    !['ORD', 'DEL'].includes(item.status)
  ) {
    return false;
  }
}

      if (poStatusFilter !== 'all') {
        const isNotCreated = !item.po_created;
        const isCreated = item.po_created && !item.po_sent;
        const isSent = item.po_sent && !item.po_received;
        const isPaid = item.po_received;

        if (poStatusFilter === 'not-created' && !isNotCreated) return false;
        if (poStatusFilter === 'created' && !isCreated) return false;
        if (poStatusFilter === 'sent' && !isSent) return false;
        if (poStatusFilter === 'paid' && !isPaid) return false;
      }

      if (billingFilter !== 'all') {
        const isNotCreated = !item.inv_created;
        const isCreated = item.inv_created && !item.inv_sent;
        const isSent = item.inv_sent && !item.inv_received;
        const isPaid = item.inv_received;

        if (billingFilter === 'not-created' && !isNotCreated) return false;
        if (billingFilter === 'created' && !isCreated) return false;
        if (billingFilter === 'sent' && !isSent) return false;
        if (billingFilter === 'paid' && !isPaid) return false;
      }

      if (needsActionActive) {
        const needsAction =
          item.client_approval !== 'APR' ||
          !item.inv_created ||
          !item.inv_received ||
          !item.inv_sent ||
          !item.po_created ||
          !item.po_received ||
          !item.po_sent;

        if (!needsAction) return false;
      }

      return true;
    });
  }, [procurementItems, debouncedSearchText, roomFilter, supplierFilter, approvalFilter, sampleFilter, logisticsFilter, logisticStatusFilter, poStatusFilter, billingFilter, dateFilter, needsActionActive]);

  // Group filtered items by room for display
  const groupedItems = useMemo(() => {
    if (!filteredItems.length) return { type: [] };

    const grouped: Record<string, any> = {};
    filteredItems.forEach(item => {
      const roomName = item.room?.name || t('unassigned');
      if (!grouped[roomName]) {
        grouped[roomName] = {
          id: item.room?.id,
          text: roomName,
          product: [],
          totalPrice: 0,
          itemCount: 0,
        };
      }

      const product = {
        ...item,
        supplier: item?.supplier,
      };

      grouped[roomName].product.push(product);
      grouped[roomName].itemCount++;

      // Pre-calculate totals for the room
      if (item.client_approval !== 'REJ') {
        const unitPrice = item.unit_price ? parseFloat(String(item.unit_price).replace(/[^\d.]/g, '')) : 0;
        const price = unitPrice > 0 ? unitPrice : getProcurementUnitPrice(item);
        const qty = Number(item.quantity) || 1;
        grouped[roomName].totalPrice += price * qty;
      }
    });

    // Final formatting for pre-calculated totals
    const result = Object.values(grouped).map(room => ({
      ...room,
      totalPriceFormatted: room.totalPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }));

    return { type: result };
  }, [filteredItems]);

  const totalItemsCount = useMemo(() => {
    if (!groupedItems?.type) return 0;

    return groupedItems.type.reduce((sum, item) => {
      return sum + (Array.isArray(item.product) ? item.product.length : 0);
    }, 0);
  }, [groupedItems]);

  const totalPendingCount = useMemo(() => {
    if (!filteredItems || !Array.isArray(filteredItems)) return 0;

    return filteredItems.filter(item => item.client_approval !== 'APR').length;
  }, [filteredItems]);

  const totalDeliveryCount = useMemo(() => {
    if (!filteredItems || !Array.isArray(filteredItems)) return 0;

    return filteredItems.filter(item => item.status === 'DEL').length;
  }, [filteredItems]);

  const totalCostCount = useMemo(() => {
    if (!filteredItems || !Array.isArray(filteredItems)) return 0;
    return filteredItems.reduce((cost, item) => {
      // Skip rejected items
      if (item.client_approval === 'REJ') return cost;

      const quantity = Number(item.quantity) || 1;
      const price = getProcurementUnitPrice(item);
      return cost + price * quantity;
    }, 0);
  }, [filteredItems]);

  const totalQuantity = useMemo(() => {
    if (!filteredItems || !Array.isArray(filteredItems)) return 0;

    return filteredItems.reduce((total, item) => {
      if (item.unit_type == 'M^^2' || item?.unit_type == 'M') {
        return total + 1;
      }
      return Math.round(total + (Number(item.quantity) || 1));
    }, 0);
  }, [filteredItems]);

  // Top summary
  const procurementStats = [
    { title: t('stats.totalItems'), value: totalItemsCount, subtitle: t('stats.totalItemsSub'), icon: Package },
    { title: t('stats.totalQuantity'), value: totalQuantity, subtitle: t('stats.totalQuantitySub'), icon: Layers },
    { title: t('stats.pendingApproval'), value: totalPendingCount, subtitle: t('stats.pendingApprovalSub'), icon: ClipboardCheck },
    {
      title: t('stats.totalCost'),
      value: `${currency?.symbol}${totalCostCount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: t('stats.totalCostSub'),
      icon: DollarSign,
    },

    {
      title: t('stats.deliveryProgress'),
      value: `${totalItemsCount && totalDeliveryCount ? Math.min(100, Math.ceil((totalDeliveryCount / totalItemsCount) * 100)) : 0}%`,
      subtitle: `${totalDeliveryCount || 0} of ${totalItemsCount || 0} delivered`,
      icon: Truck,
    },
  ];

  const needsActionCount = useMemo(() => {
    if (!procurementItems || !Array.isArray(procurementItems)) return 0;
    return procurementItems.filter(
      item =>
        item.client_approval !== 'APR' ||
        !item.inv_created ||
        !item.inv_received ||
        !item.inv_sent ||
        !item.po_created ||
        !item.po_received ||
        !item.po_sent,
    ).length;
  }, [procurementItems]);

  const canCreatePO = useMemo(() => {
    if (!financePermission) return false;
    if (checkedItems.length === 0) return false;
    // const suppliers = new Set(checkedItems.map(item => item.supplier?.id));
    // if (suppliers.size !== 1) return false;
    const allApproved = checkedItems.every(item => item.client_approval === 'APR');
    if (!allApproved) return false;
    const noExistingPO = checkedItems.every(item => !item.po_created);
    if (!noExistingPO) return false;
    return true;
  }, [checkedItems]);

  const canCreateInvoice = useMemo(() => {
    if (!financePermission) return false;
    if (checkedItems.length === 0) return false;
    return checkedItems.every(item => !item.invoice && item.po_created);
  }, [checkedItems]);

  const canMarkSupplierPaid = useMemo(() => {
    if (checkedItems.length === 0) return false;
    // Assuming we check if PO exists and is not paid.
    // Note: We don't have supplierPaidAt in the item directly from the new API yet,
    // unless it's mapped. For now, we'll disable this or check what we have.
    // The previous code checked item.poId && !item.supplierPaidAt
    return false;
  }, [checkedItems]);

  const canMarkClientPaid = useMemo(() => {
    if (checkedItems.length === 0) return false;
    // Previous code: item.invoiceId && !item.clientPaidAt
    // New API item has xero_invoice_number.
    return false;
  }, [checkedItems]);

  const hasActiveFilters = useMemo(() => {
    return (
      roomFilter !== 'all' ||
      supplierFilter !== 'all' ||
      approvalFilter !== 'all' ||
      poStatusFilter !== 'all' ||
      billingFilter !== 'all' ||
      sampleFilter !== 'all' ||
      logisticsFilter !== 'all' ||
      logisticStatusFilter !== 'all' ||
      dateFilter !== 'all'
    );
  }, [roomFilter, supplierFilter, approvalFilter, poStatusFilter, billingFilter, sampleFilter, logisticsFilter, logisticStatusFilter, dateFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (roomFilter !== 'all') count++;
    if (supplierFilter !== 'all') count++;
    if (approvalFilter !== 'all') count++;
    if (poStatusFilter !== 'all') count++;
    if (billingFilter !== 'all') count++;
    if (sampleFilter !== 'all') count++;
    if (logisticsFilter !== 'all') count++;
    if (logisticStatusFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    return count;
  }, [roomFilter, supplierFilter, approvalFilter, poStatusFilter, billingFilter, sampleFilter, logisticsFilter, logisticStatusFilter, dateFilter]);

  const uniqueSuppliers = useMemo(() => {
    if (!procurementItems || !Array.isArray(procurementItems)) return [];
    if (!procurementItems || !Array.isArray(procurementItems)) return [];
    return [...new Set(procurementItems.map(item => getProcurementSupplierName(item)).filter(Boolean))].sort();
  }, [procurementItems]);

  const uniqueRooms = useMemo(() => {
    if (!procurementItems || !Array.isArray(procurementItems)) return [];
    return [...new Set(procurementItems.map(item => item.room?.name).filter(Boolean))].sort();
  }, [procurementItems]);

  function resetFilters() {
    startTransition(() => {
      setRoomFilter('all');
      setSupplierFilter('all');
      setApprovalFilter('all');
      setPOStatusFilter('all');
      setBillingFilter('all');
      setSampleFilter('all');
      setLogisticsFilter('all');
      setLogisticStatusFilter('all');
      setDateFilter('all');
    });
  }

  const handleClickPO = () => {
    setButtonLoadingPO(true);
    const ids = [...new Set(checkedItems.map(i => i.id))];
    mutate(
      {
        url: `finance/create-po-from-procurement/create_po/`,
        data: { procurement_ids: ids },
      },
      {
        onSuccess: () => {
          queryClient.refetchQueries({
            queryKey: [`projects/project-procurements/?project_id=${params.id}`],
          });
          queryClient.refetchQueries({
            queryKey: [`finance/studio-finance/`],
          });
          setCheckedItems([]);
          toast(t('poCreated'));
          setButtonLoadingPO(false);
        },
      },
    );
  };

  const handleClickInvoice = () => {
    setButtonLoadingInvoice(true);
    const ids = [...new Set(checkedItems.map(i => i.po))];
    mutate(
      {
        url: `finance/create-invoice/create_invoice/`,
        data: { po_ids: ids },
      },
      {
        onSuccess: () => {
          queryClient.refetchQueries({
            queryKey: [`projects/project-procurements/?project_id=${params.id}`],
          });
          queryClient.refetchQueries({
            queryKey: [`finance/studio-finance/`],
          });
          setCheckedItems([]);
          toast(t('invoiceCreated'));
          setButtonLoadingInvoice(false);
        },
      },
    );
  };

  const confirmBulkDelete = () => {
    setIsBulkDeleteOpen(false);
    handleDelete();
  };

  const handleDelete = () => {
    setButtonLoadingDelete(true);
    const ids = [...new Set(checkedItems.map(i => i.id))];
    mutate(
      {
        url: `projects/procurements/bulk-delete/`,
        data: { ids: ids },
      },
      {
        onSuccess: () => {
          queryClient.refetchQueries({
            queryKey: [`projects/project-procurements/?project_id=${params.id}`],
          });
          queryClient.refetchQueries({
            queryKey: [`finance/studio-finance/`],
          });
          setCheckedItems([]);
          toast(t('deleted'));
          setButtonLoadingDelete(false);
        },
      },
    );
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    const statusLabels: Record<string, string> = {
      QT: 'Quoting', IR: 'Internal Review', OS: 'Out of Stock', CR: 'Client Review',
      ORD: 'Ordered', PD: 'Payment Due', IT: 'In Transit', INS: 'Installed',
      DEL: 'Delivered', IA: 'Internally Approved',
    };
    const logisticStatusMap: Record<string, string> = {
      IT: 'In Transit', DD: 'Delivered', NO: 'Not Ordered',
    };
    setTimeout(() => {
      const sampleLabels: Record<string, string> = {
        REQ: 'Requested', REC: 'Received', SUB: 'Submitted',
      };

      const headers = [
        'Product', 'Room', 'Supplier', 'Quantity', 'Unit',
        'Unit Price', 'Total Price',
        'Status', 'Approval',
        'PO', 'PO Status',
        'Billing', 'Billing Status',
        'Sample', 'Logistics', 'Delivery Date',
        'Lead Time', 'Tracking Number',
      ];
      const rows = filteredItems.map(item => {
        const qty = Number(item.quantity) || 1;
        const unitPrice = getProcurementUnitPrice(item);
        const totalPrice = unitPrice * qty;
        const poStatus = item.po_received ? 'Paid' : item.po_sent ? 'Sent' : item.po_created ? 'Created' : 'Not Created';
        const billingStatus = item.inv_received ? 'Paid' : item.inv_sent ? 'Sent' : item.inv_created ? 'Created' : 'Not Created';
        const approval = item.client_approval === 'APR' ? 'Approved' : item.client_approval === 'REJ' ? 'Rejected' : item.client_approval === 'RVW' ? 'In Review' : 'Pending';
        const status = statusLabels[item.status] || item.status || '';
        const logisticStatus = logisticStatusMap[item.logistic_status] || item.logistic_status || '';
        const sample = sampleLabels[item.sample] || (item.sample ? item.sample : 'Not Required');
        const deliveryDate = item.ETA ? new Date(item.ETA).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
        return [
          getProcurementProductName(item),
          item.room?.name || '',
          getProcurementSupplierName(item),
          item.quantity || '',
          item.unit_type || 'EA',
          unitPrice > 0 ? unitPrice.toFixed(2) : '',
          totalPrice > 0 ? totalPrice.toFixed(2) : '',
          status,
          approval,
          item.display_po || '',
          poStatus,
          item.display_invoice || '',
          billingStatus,
          sample,
          logisticStatus,
          deliveryDate,
          item.lead_time || '',
          item.tracking_number || '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
      });
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const projectName = projectData?.project_name || 'Project';
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(':', '.');
      link.href = url;
      link.download = `${projectName} - Procurement - ${dateStr} ${timeStr}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 2000);
  };

  const handleSendClientToggle = (value: boolean) => {
    mutate(
      {
        url: `projects/client-access/`,
        data: { project_id: params?.id, client_access: value },
      },
      {
        onSuccess: () => {
          queryClient.refetchQueries({
            queryKey: [`projects/projects/${params?.id}/`],
          });
          toast('Procurement client access updated successfully');
        },
      },
    );
  };

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <div className="">
      <div className="space-y-4">
        {/* Contractor Sharing Banner */}
        {shareWithContractor && contractorName && (
          <Card className="border-slatex-200 bg-white">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-slatex-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t('sharingWith', { name: decodeURIComponent(contractorName) })}</p>
                  <p className="text-xs text-neutral-500">{t('sharingHint')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {checkedItems.length > 0 && (
                  <Button
                    size="sm"
                    className="h-8 bg-slatex-700 text-white hover:bg-slatex-800"
                    onClick={handleBulkShare}
                    disabled={isSharingItems}
                  >
                    {isSharingItems ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        {t('sharing')}
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        {t('shareSelected', { count: checkedItems.length })}
                      </>
                    )}
                  </Button>
                )}
                <Link href={`/projects/${params.id}/contractors`}>
                  <Button variant="outline" size="sm" className="h-8 bg-white">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    {t('backToContractors')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Top stats */}
        <AnimatePresence mode="wait" initial={false}>
          {!visible && (
            <motion.div
              key="procurement-stats"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {procurementStats.map(stat => (
                  <Card key={stat.title} className="border border-greige-500/30 shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-slatex-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-700">{stat.title}</p>
                          <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
                          <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                ref={searchInputRef}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-10 pr-9 w-64 h-9"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <AnimatePresence>
                  {searchInput !== debouncedSearchText ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="block text-neutral-800 border-greige-500/30 border bg-[#f3f4f6] font-mono rounded-[6px] h-auto py-[1px] px-[6px] text-[11px] "
                    >
                      f
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {procurementPermission && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-greige-500/30 bg-white"
                onClick={() => setCatalogOpen(true)}
              >
                <Store className="mr-2 h-4 w-4" />
                {t('browseCatalog')}
              </Button>
            )}

            <Button
              variant={'default'}
              size="sm"
              className={cn(
                'h-9 border',
                needsActionActive
                  ? 'bg-neutral-600 hover:bg-neutral-700'
                  : 'bg-white hover:text-white text-neutral-900 border-greige-500/30',
              )}
              onClick={() => setNeedsActionActive(!needsActionActive)}
            >
              Needs action
              {needsActionCount > 0 && (
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded',
                    needsActionActive ? 'bg-white text-neutral-900' : 'bg-stone-100 text-neutral-700',
                  )}
                >
                  {needsActionCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-white border-greige-500/30" disabled={checkedItems.length === 0}>
                  Bulk actions
                  {checkedItems.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded bg-stone-100 text-neutral-700">
                      {checkedItems.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {financePermission && <DropdownMenuItem onClick={handleClickPO} disabled={!canCreatePO}>
                  Create PO
                </DropdownMenuItem>}
                {financePermission && <DropdownMenuItem disabled={!canCreateInvoice}>Create Invoice</DropdownMenuItem>}
                <DropdownMenuItem disabled={!canMarkSupplierPaid}>Mark Supplier Paid</DropdownMenuItem>
                <DropdownMenuItem disabled={!canMarkClientPaid}>Mark Client Paid</DropdownMenuItem>
                {procurementPermission && <DropdownMenuItem onClick={() => setContractorDialogOpen(true)}>Share to Contractor</DropdownMenuItem>}
               {procurementDeletePermission && <DropdownMenuSeparator />}
                {procurementDeletePermission && <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  disabled={checkedItems.length === 0 || buttonLoadingDelete}
                >
                  Remove Selected
                </DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className={cn(
                'h-9 w-9 flex items-center justify-center rounded-md border transition bg-white text-neutral-700 border-greige-500/30 hover:bg-stone-100',
              )}
              aria-label={visible ? 'Hide' : 'Show'}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* Consolidated Filter Button */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-white border-greige-500/30">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-umber-100 text-umber-700 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[520px] p-4" side="right" align="center">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-neutral-900">Filters</h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Room Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Room</label>
                      <Popover open={roomOpen} onOpenChange={setRoomOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full h-9 justify-between bg-white border-greige-500/30 text-sm font-normal capitalize"
                          >
                            {roomFilter === 'all' ? 'All Rooms' : roomFilter.length > 15 ? `${roomFilter.substring(0, 15)}...` : roomFilter}
                            <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search rooms..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>{t('noRoomFound')}</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    updateFilter(setRoomFilter)('all');
                                    setRoomOpen(false);
                                  }}
                                >
                                  <Check className={cn('mr-2 h-4 w-4', roomFilter === 'all' ? 'opacity-100' : 'opacity-0')} />
                                  All Rooms
                                </CommandItem>
                                {uniqueRooms.map(roomName => (
                                  <CommandItem
                                    key={roomName}
                                    value={roomName}
                                    onSelect={currentValue => {
                                      updateFilter(setRoomFilter)(currentValue === roomFilter ? 'all' : currentValue);
                                      setRoomOpen(false);
                                    }}
                                  >
                                    <Check className={cn('mr-2 h-4 w-4', roomFilter === roomName ? 'opacity-100' : 'opacity-0')} />
                                    <span className="capitalize">{roomName}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Supplier Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Supplier</label>
                      <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full h-9 justify-between bg-white border-greige-500/30 text-sm font-normal"
                          >
                            {supplierFilter === 'all'
                              ? 'All Suppliers'
                              : supplierFilter.length > 15
                                ? `${supplierFilter.substring(0, 15)}...`
                                : supplierFilter}
                            <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search suppliers..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No supplier found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    updateFilter(setSupplierFilter)('all');
                                    setSupplierOpen(false);
                                  }}
                                >
                                  <Check className={cn('mr-2 h-4 w-4', supplierFilter === 'all' ? 'opacity-100' : 'opacity-0')} />
                                  All Suppliers
                                </CommandItem>
                                {uniqueSuppliers.map(supplierName => (
                                  <CommandItem
                                    key={supplierName}
                                    value={supplierName}
                                    onSelect={currentValue => {
                                      updateFilter(setSupplierFilter)(currentValue === supplierFilter ? 'all' : currentValue);
                                      setSupplierOpen(false);
                                    }}
                                  >
                                    <Check className={cn('mr-2 h-4 w-4', supplierFilter === supplierName ? 'opacity-100' : 'opacity-0')} />
                                    {supplierName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Approval Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Approval</label>
                      <Select value={approvalFilter} onValueChange={updateFilter(setApprovalFilter)}>
                        <SelectTrigger className="w-full h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue>
                            {approvalFilter === 'all'
                              ? 'All'
                              : approvalFilter === 'APR'
                                ? 'Approved'
                                : approvalFilter === 'REJ'
                                  ? 'Rejected'
                                  : approvalFilter === 'RVW'
                                    ? 'Review'
                                    : approvalFilter}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="RVW">Review</SelectItem>
                          <SelectItem value="APR">Approved</SelectItem>
                          <SelectItem value="REJ">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* PO Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">PO Status</label>
                      <Select value={poStatusFilter} onValueChange={updateFilter(setPOStatusFilter)}>
                        <SelectTrigger className="w-full capitalize h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue className='capitalize'>
                            {poStatusFilter === 'all' ? 'All' : poStatusFilter === 'not-created' ? 'Not Created' : poStatusFilter === 'created' ? 'Created' : poStatusFilter === 'sent' ? 'Sent' : poStatusFilter === 'paid' ? 'Paid' : poStatusFilter}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="not-created">Not Created</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Billing Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Billing</label>
                      <Select value={billingFilter} onValueChange={updateFilter(setBillingFilter)}>
                        <SelectTrigger className="w-full h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue>
                            {billingFilter === 'all' ? 'All' : billingFilter === 'not-created' ? 'Not Created' : billingFilter === 'created' ? 'Created' : billingFilter === 'sent' ? 'Sent' : billingFilter === 'paid' ? 'Paid' : billingFilter}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="not-created">Not Created</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sample Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Sample</label>
                      <Select value={sampleFilter} onValueChange={updateFilter(setSampleFilter)}>
                        <SelectTrigger className="w-full h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue>{sampleFilter === 'all' ? 'All' : sampleFilter === 'none' ? 'Submitted' : sampleFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Requested">Requested</SelectItem>
                          <SelectItem value="Received">Received</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Not Requested">Not Requested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Logistics Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Status</label>
                      <Select value={logisticsFilter} onValueChange={updateFilter(setLogisticsFilter)}>
                        <SelectTrigger className="w-full h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue>{logisticsLabels[logisticsFilter] || logisticsFilter}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(logisticsLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Logistics Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600">Logistics Status</label>
                      <Select value={logisticStatusFilter} onValueChange={setLogisticStatusFilter}>
                        <SelectTrigger className="w-full h-9 bg-white border-greige-500/30 text-sm">
                          <SelectValue>{logisticStatusLabels[logisticStatusFilter] || 'All'}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="IT">In Transit</SelectItem>
                          <SelectItem value="DD">Delivered</SelectItem>
                          <SelectItem value="NO">Not Ordered</SelectItem> 
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900" onClick={resetFilters}>
                        Reset all
                      </Button>
                    )}
                    <Button size="sm" onClick={saveFilter} className="bg-umber-900 text-neutral-600 hover:bg-umber-800">
                      Save view
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-white gap-1.5"
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <div className="flex bg-white border w-[140px] rounded-lg py-[7px] items-center gap-1">
              <Switch
                title="Toggle Send To Client"
                checked={projectData?.procurement_client_access}
                onCheckedChange={checked => {
                  if (checked) {
                    handleSendClientToggle(true);
                  } else {
                    handleSendClientToggle(false);
                  }
                }}
                id="timer-toggle"
                className="scale-[80%]  data-[state=checked]:bg-black"
              />
              <span className="text-[14px] font-medium">Client Portal</span>
            </div>
          </div>
        </div>

        {/* AI Procurement Insights */}
        <ProcurementInsights
          projectId={params?.id}
          procurementItems={procurementItems}
          className=""
        />

        {showTip && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-900 flex-1">Select multiple items from the same supplier to create one PO.</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 shrink-0"
              onClick={() => setShowTip(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/*Table */}
        <ProcurementTable
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          groupedItems={groupedItems}
          loading={isLoading}
          project={projectData}
          procurementPermission={procurementPermission}
        />
      </div>
      
     {checkedItems?.length > 0 && <div className='h-20 bg-transparent duration-300'></div>}

      {/* Product detail sheet */}
      <ProductDetailSheet open={open} onOpenChange={setOpen} product={selected} />

      <CatalogBrowseDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        projectId={Number(params.id)}
      />

      <AnimatePresence mode="wait" initial={false}>
        {checkedItems?.length > 0 && (
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            exit={{ y: 15 }}
            transition={{
              duration: 0.1,
              ease: 'linear',
            }}
            className="fixed shadow-2xl bottom-0 left-0 right-0 z-30 bg-white border-t border-greige-500/30 drop-shadow-top "
          >
            <div className=" px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-neutral-900">
                    {checkedItems?.length} item{checkedItems?.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" onClick={() => setCheckedItems([])}>
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
             { financePermission &&     <Button
                    variant="outline"
                    size="sm"
                    disabled={!canCreatePO || buttonLoadingPO}
                    onClick={handleClickPO}
                    className="border-greige-500/30 bg-transparent flex items-center gap-2"
                    title={!canCreatePO ? 'All selected items must be from the same supplier and have Approved status' : ''}
                  >
                    {buttonLoadingPO ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating..
                      </span>
                    ) : (
                      'Create PO'
                    )}
                  </Button>}

                { financePermission &&  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canCreateInvoice || buttonLoadingInvoice}
                    onClick={handleClickInvoice}
                    className="border-greige-500/30 bg-transparent flex items-center gap-2"
                    title={!canCreateInvoice ? 'All selected items must be from the same supplier and have Approved status' : ''}
                  >
                    {buttonLoadingInvoice ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating..
                      </span>
                    ) : (
                      'Create Invoice'
                    )}
                  </Button>}

                 {procurementPermission &&  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContractorDialogOpen(true)}
                    className="border-greige-500/30 bg-transparent flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Share to Contractor
                  </Button>}

                  {/* <Button
                  variant="outline"
                  size="sm"
                  disabled={checkedItems.length === 0 || buttonLoadingDelete}
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="border-greige-500/30 bg-transparent flex items-center gap-2"
                  title={!canCreateInvoice ? 'All selected items must be from the same supplier and have Approved status' : ''}
                >
                  {buttonLoadingDelete ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing..
                    </span>
                  ) : (
                    'Remove Selected'
                  )}
                </Button> */}

                 { procurementPermission && <Button
                    variant="outline"
                    size="sm"
                    onMouseEnter={() => setIsDeleteHovered(true)}
                    onMouseLeave={() => setIsDeleteHovered(false)}
                    disabled={checkedItems.length === 0 || buttonLoadingDelete}
                    onClick={() => setIsBulkDeleteOpen(true)}
                    className="border-greige-500/30 bg-white hover:bg-red-500 hover:border-red-600 transition-all group relative overflow-hidden h-9 px-4 min-w-[150px]"
                  >
                    {buttonLoadingDelete ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        <span className="text-neutral-600">Removing...</span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-center">
                        <motion.div
                          initial={false}
                          animate={isDeleteHovered ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -10, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.div>

                        <div className="relative flex items-center justify-center">
                          <motion.span
                            animate={isDeleteHovered ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="block whitespace-nowrap text-neutral-700 pr-2"
                          >
                            Remove Selected
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={isDeleteHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute block whitespace-nowrap text-white font-semibold"
                          >
                            Delete
                          </motion.span>
                        </div>
                      </div>
                    )}
                  </Button> }
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Remove Selected Items?"
        description={`Are you sure you want to remove ${checkedItems.length} selected item${checkedItems.length > 1 ? 's' : ''}? This action cannot be undone.`}
        itemName={`${checkedItems.length > 0 ? `${checkedItems.length} Item${checkedItems.length > 1 ? 's' : ''}` : ''}`}
        requireConfirmation={false}
        confirmText="Remove"
      />

      {/* Contractor Share Dialog */}
      <SelectContractorDialog
        projectId={params.id}
        isOpen={contractorDialogOpen}
        onClose={() => setContractorDialogOpen(false)}
        onSelect={() => {
          setContractorDialogOpen(false);
          setCheckedItems([]);
          queryClient.invalidateQueries({ queryKey: ['procurements'] });
        }}
        procurementIds={checkedItems.map(item => Number(item.id))}
        title={`Share ${checkedItems.length} item${checkedItems.length > 1 ? 's' : ''} with...`}
      />
    </div>
  );
}

export default function ProjectProcurementPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="projects.view" redirectTo={`/projects/${params.id}`}>
      <ProjectProcurementPageContent params={params} />
    </PermissionGuard>
  );
}
