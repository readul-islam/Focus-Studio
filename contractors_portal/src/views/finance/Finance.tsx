import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import { Link, useNavigate } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import useUser from '@/hooks/userUser';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { Helmet } from 'react-helmet-async';
import { statusColors } from '@/lib/status-colors';
import { useTranslations } from 'next-intl';
import { useFinanceStatusOptions, useShortDate } from '@/lib/i18n-helpers';

// Inline StatusBadge component
const StatusBadge = ({ status, label, className }: { status: string; label: string; className?: string }) => {
  return (
    <Badge variant="outline" className={`font-medium border ${className}`}>
      {label}
    </Badge>
  );
};



const Finance = () => {
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState('All');
  const t = useTranslations('finance');
  const tc = useTranslations('common');
  const STATUS_OPTIONS = useFinanceStatusOptions();
  const formatShortDate = useShortDate();

  const navigate = useNavigate();
  const { user, project: projectData } = useUser()

  const {
    data: financeData,
    isLoading: financeLoading,
  } = useFetch(`contractor_portal/invoices/?project_id=${projectData?.project_id}`, {
    enabled: !!projectData?.project_id
  })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PD': // Paid
        return `${statusColors.paid.bg} ${statusColors.paid.text} ${statusColors.paid.border}`;

      case 'DFT': // Draft
      case 'NE': // New
        return `${statusColors.draft.bg} ${statusColors.draft.text} ${statusColors.draft.border}`;

      case 'SNT': // Sent
        return `${statusColors.sent.bg} ${statusColors.sent.text} ${statusColors.sent.border}`;

      case 'APR': // Approved
      case 'RCV': // Received
        return `${statusColors.approved.bg} ${statusColors.approved.text} ${statusColors.approved.border}`;

      case 'OVD': // Overdue
        return `${statusColors.overdue.bg} ${statusColors.overdue.text} ${statusColors.overdue.border}`;

      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const safeIncludes = (value: any, search: string) =>
    typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase());

  const filteredInvoices = useMemo(() => {
    // Check if financeData is an array or has a results property (common in DRF)
    const invoices = Array.isArray(financeData) ? financeData : (financeData?.results || []);
    if (!invoices) return [];

    const lowerSearch = searchText.toLowerCase();
    const isAllStatus = sort === 'All';

    return invoices.filter((inv: any) => {
      const displayInv = inv.invoice_number || '';
      // const clientName = inv.client?.company_name || inv.client?.name || '';
      // const projectName = inv.project?.project_name || '';

      const matchesSearch =
        !searchText ||
        safeIncludes(displayInv, lowerSearch);
      // safeIncludes(clientName, lowerSearch) ||
      // safeIncludes(projectName, lowerSearch);

      const matchesStatus = isAllStatus || inv.status === sort;

      return matchesSearch && matchesStatus;
    });
  }, [financeData, searchText, sort]);

  // Calculate totals for stats
  let totalInvoiceOrder = 0;
  let currencySymbol = '£'; // Default

  // Helper to access the list safely
  const invoiceList = Array.isArray(financeData) ? financeData : (financeData?.results || []);

  if (invoiceList.length > 0) {
    invoiceList.forEach((item: any) => {
      const temp = parseFloat(item.total_amount) || 0;
      totalInvoiceOrder += temp;
      if (item.currency) currencySymbol = item.currency;
    });
  }

  const financeStats = [
    {
      title: t('totalInvoices'),
      value: (
        <span className="flex items-center gap-1">
          <ViewCurrencySymbol code={projectData?.currency || 'GBP'} />
          {totalInvoiceOrder.toLocaleString('en-GB', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </span>
      ),
      subtitle: t('invoicesCount', { count: invoiceList.length || 0 }),
      icon: FileText,
    },
  ];

  const handleOpenInvoice = (id: string) => {
    // Navigate to the invoice detail page
    navigate(`/finance/${id}`);
  };

  return (
    <DashboardLayout>
       <Helmet title={t('pageTitle')} />
      <div className="flex-1 bg-gray-50 md:p-6 h-full">
        <div className=" space-y-6">
          {/* Finance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {financeStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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

          {/* Actions Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full bg-white">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-10 w-full bg-white"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  aria-label={t('searchAria')}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='h-10 w-[180px] bg-white justify-between' variant="outline" size='sm'>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      {STATUS_OPTIONS.find(opt => opt.value === sort)?.label || tc('filter')}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                  {STATUS_OPTIONS.map(status => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => setSort(status.value)}
                      className={sort === status.value ? 'font-semibold text-black' : ''}
                    >
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('number')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-40">{t('type')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('dateIssued')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('dueDate')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">{t('amount')}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-28">{t('statusColumn')}</th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600 whitespace-nowrap w-24">{t('actions')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  <>
                    {financeLoading &&
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                          </td>
                        </tr>
                      ))}
                  </>
                  {!financeLoading &&
                    filteredInvoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          <Link className="hover:underline" to={`/finance/${inv.id}`}>
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t('invoice')}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatShortDate(inv.date)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatShortDate(inv.due_date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          <ViewCurrencySymbol code={inv.currency || projectData?.currency || 'GBP'} />
                          {Number(inv.total_amount).toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={inv.status}
                            label={STATUS_OPTIONS.find(o => o.value === inv.status)?.label || inv.status}
                            className={getStatusStyle(inv.status)}
                          />
                        </td>
                        <td className="px-2 pr-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                aria-label={t('actionsFor', { number: inv.invoice_number })}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link className="w-full" to={`/finance/${inv.id}`}>
                                  {t('viewDetails')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <button
                                  onClick={() => handleOpenInvoice(inv.id)}
                                  className="w-full text-left"
                                >
                                  {t('downloadPdf')}
                                </button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="md:hidden space-y-4">
            {financeLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}

            {!financeLoading &&
              filteredInvoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link to={`/finance/${inv.id}`} className="font-semibold text-gray-900 hover:underline">
                          {inv.invoice_number}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{t('invoice')}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link className="w-full" to={`/finance/${inv.id}`}>
                              {t('viewDetails')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <button
                              onClick={() => handleOpenInvoice(inv.id)}
                              className="w-full text-left"
                            >
                              {t('downloadPdf')}
                            </button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('amount')}:</span>
                        <span className="font-medium text-gray-900">
                          <ViewCurrencySymbol code={inv.currency || projectData?.currency || 'GBP'} />
                          {Number(inv.total_amount).toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('dateIssued')}:</span>
                        <span className="text-sm text-gray-900">
                          {formatShortDate(inv.date)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('dueDate')}:</span>
                        <span className="text-sm text-gray-900">
                          {formatShortDate(inv.due_date)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">{t('statusColumn')}:</span>
                        <StatusBadge
                          status={inv.status}
                          label={STATUS_OPTIONS.find(o => o.value === inv.status)?.label || inv.status}
                          className={getStatusStyle(inv.status)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
