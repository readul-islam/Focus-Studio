"use client"
import { PermissionGuard } from '@/components/PermissionGuard';

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, FileText, MoreHorizontal, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CrmNav } from "@/components/crm-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteDialog } from "@/components/DeleteDialog"
import useProposalsStore from "@/store/useProposalsStore"
import useFetch from "@/hooks/useFetch"
import { postData, deleteData } from "@/lib/Api"
import { gooeyToast as toast } from 'goey-toast'
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';

function ProposalsPageContent() {
  const t = useTranslations('crmProposalsPage');
  const tc = useTranslations('common');
  const router = useRouter()

  const PROPOSAL_STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
    DFT: { label: t('statusDraft'), variant: "secondary", className: "bg-stone-100 text-gray-700 hover:bg-stone-100" },
    SNT: { label: t('statusSent'), variant: "default", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    ACC: { label: t('statusAccepted'), variant: "default", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
    DCL: { label: t('statusDeclined'), variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  }
  const {
    searchTerm,
    setSearchTerm,
  } = useProposalsStore();

  // Real proposals from API
  const { data: proposalsData, isLoading: proposalsLoading, refetch: refetchProposals } = useFetch('/crm/proposals/');
  const proposals: any[] = useMemo(() => {
    const raw = proposalsData as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
  }, [proposalsData]);

  const { can } = usePermissions();
  const clientsPermission = can('clients.edit');
  const clientsDeletePermission = can('clients.delete');

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<any>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return proposals.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const clientName = (p.client_name || p.client || "").toLowerCase();
      const matchesSearch = title.includes(term) || clientName.includes(term);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  const handleOpenNew = () => {
    router.push("/crm/proposals/new")
  };

  const handleEditProposal = (proposal: any) => {
    router.push(`/crm/proposals/${proposal.id}`)
  };

  const handleSendProposal = async (proposal: any) => {
    if (sendingId) return;
    setSendingId(String(proposal.id));
    try {
      await postData({ url: `/crm/proposals/${proposal.id}/send/` });
      toast.success(t('toasts.sentSuccess'));
      refetchProposals();
    } catch {
      toast.error(t('toasts.sendFailed'));
    } finally {
      setSendingId(null);
    }
  };

  const handleViewPdf = (proposal: any) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/crm/proposals/${proposal.id}/pdf/`, "_blank");
  };

  const openDeleteDialog = (proposal: any) => {
    setProposalToDelete(proposal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProposal = async () => {
    if (!proposalToDelete) return;
    setDeletingId(String(proposalToDelete.id));
    try {
      await deleteData({ url: `/crm/proposals/${proposalToDelete.id}/`, data: undefined });
      toast.success(t('toasts.deleted'));
      refetchProposals();
    } catch (error: any) {
      toast.error(error?.message || t('toasts.deleteFailed'));
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      await deleteData({ url: '/crm/proposals/bulk_delete/', data: { ids: Array.from(selectedIds).map(Number) } });
      toast.success(t('toasts.bulkDeleted', { count: selectedIds.size }));
      setSelectedIds(new Set());
      refetchProposals();
    } catch {
      toast.error(t('toasts.bulkDeleteFailed'));
    } finally {
      setIsDeletingBulk(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => String(p.id))));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = PROPOSAL_STATUS[status] || PROPOSAL_STATUS.DFT;
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className=" w-full flex flex-col flex-1 min-h-0 space-y-6">
        <CrmNav />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 bg-white">
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="DFT">{t('statusDraft')}</SelectItem>
                <SelectItem value="SNT">{t('statusSent')}</SelectItem>
                <SelectItem value="ACC">{t('statusAccepted')}</SelectItem>
                <SelectItem value="DCL">{t('statusDeclined')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {clientsPermission && (
              <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800" onClick={handleOpenNew}>
                  <Plus className="w-4 h-4" />
                  {t('newProposal')}
                </Button>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout">
              {selectedIds.size > 0 && clientsDeletePermission && (
                <motion.div
                  key="delete"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)} disabled={isDeletingBulk}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {tc('delete')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar scrollbar-thin">
            <table className="w-full table-fixed">
              <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 48 }}>
                    <Checkbox
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all proposals"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 320 }}>
                    {t('proposalColumn')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 200 }}>
                    {t('clientColumn')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 140 }}>
                    {tc('value')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    {tc('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 140 }}>
                    {t('sentDateColumn')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 140 }}>
                    {t('expiresColumn')}
                  </th>
                {clientsPermission &&  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600" style={{ width: 96 }}>
                    {tc('actions')}
                  </th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {proposalsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      {t('loading')}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{t('emptyTitle')}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {searchTerm ? t('emptySearch') : t('emptySubtitle')}
                          </p>
                        </div>
                        {!searchTerm && (
                          <Button
                            size="sm"
                            onClick={handleOpenNew}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {t('createProposal')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((proposal) => {
                    const clientName = proposal.client_info?.name || proposal.client_name || proposal.client_email || (proposal.client ? `Client #${proposal.client}` : "—");
                    const currencySymbol = proposal.currency === "USD" ? "$" : proposal.currency === "EUR" ? "€" : "£";
                    const totalFormatted = proposal.total
                      ? `${currencySymbol}${Number(proposal.total).toLocaleString()}`
                      : `${currencySymbol}0`;
                    const sentDate = proposal.sent_at || proposal.sentDate || null;
                    const expiryDate = proposal.valid_until || proposal.expiryDate || null;
                    const isSending = sendingId === String(proposal.id);
                    const isDeleting = deletingId === String(proposal.id);
                    const isSelected = selectedIds.has(String(proposal.id));

                    return (
                      <tr key={proposal.id} className="hover:bg-stone-50 cursor-pointer" onClick={() => handleEditProposal(proposal)}>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(String(proposal.id))}
                            aria-label={`Select ${proposal.title}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1 min-w-0">
                            <div
                              className="font-medium text-gray-900 flex items-center gap-2 whitespace-nowrap truncate"
                              title={proposal.title}
                            >
                              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{proposal.title}</span>
                            </div>
                            {proposal.reference_number && (
                              <div className="text-xs text-gray-500 font-mono">{proposal.reference_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap truncate" title={clientName}>
                          {clientName}
                        </td>
                        <td
                          className="px-4 py-3 font-medium text-gray-900 tabular-nums whitespace-nowrap truncate"
                          title={totalFormatted}
                        >
                          {totalFormatted}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(proposal.status)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap truncate" title={sentDate || "-"}>
                          {sentDate ? new Date(sentDate).toLocaleDateString() : "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-600 whitespace-nowrap truncate"
                          title={expiryDate || "-"}
                        >
                          {expiryDate ? new Date(expiryDate).toLocaleDateString() : "-"}
                        </td>
                      {clientsPermission &&  <td className="pl-4 pr-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                aria-label={`Open actions for ${proposal.title}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                                {tc('edit')}
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem onClick={() => handleViewPdf(proposal)}>
                                View PDF
                              </DropdownMenuItem> */}
                              <DropdownMenuItem
                                onClick={() => handleSendProposal(proposal)}
                                disabled={isSending}
                              >
                                {isSending ? tc('sending') : tc('send')}
                              </DropdownMenuItem>
                              {clientsDeletePermission && <DropdownMenuSeparator />}
                              {clientsDeletePermission && <DropdownMenuItem
                                onClick={() => openDeleteDialog(proposal)}
                                disabled={isDeleting}
                                className="text-red-600"
                              >
                                {isDeleting ? tc('deleting') : tc('delete')}
                              </DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td> }
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setProposalToDelete(null); }}
        onConfirm={handleDeleteProposal}
        id={proposalToDelete?.id}
        title={t('deleteProposalTitle')}
        description={t('deleteProposalDescription')}
        itemName={proposalToDelete?.title || ""}
      />

      <DeleteDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={confirmBulkDelete}
        title={t('deleteProposalsTitle')}
        description={t('deleteProposalsDescription', { count: selectedIds.size })}
        itemName={`${selectedIds.size} proposal${selectedIds.size > 1 ? 's' : ''}`}
      />
    </div>
  )
}

export default function ProposalsPage() {
  return (
    <PermissionGuard permission="clients.view" redirectTo="/">
      <ProposalsPageContent />
    </PermissionGuard>
  );
}