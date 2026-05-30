'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Loader2, Users, Mail, Phone, Building2 } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { useTranslations } from 'next-intl';
import { gooeyToast as toast } from 'goey-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Contractor {
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

interface SelectContractorDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contractor: Contractor) => void;
  title?: string;
  procurementId?: number;
  procurementIds?: number[];
  documentId?: number;
  documentIds?: number[];
}

export function SelectContractorDialog({
  projectId,
  isOpen,
  onClose,
  onSelect,
  title,
  procurementId,
  procurementIds,
  documentId,
  documentIds,
}: SelectContractorDialogProps) {
  const t = useTranslations('contractorSelectDialog');
  const dialogTitle = title ?? t('title');
  const [searchText, setSearchText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useFetch(
    isOpen ? `contractor_portal/project/${projectId}/contractors/` : null,
    { enabled: isOpen }
  );

  const allContractors: Contractor[] = Array.isArray(data) ? data : [];

  const contractors = useMemo(() => {
    if (!searchText.trim()) return allContractors;
    const q = searchText.toLowerCase();
    return allContractors.filter(c =>
      `${c.name} ${c.surname}`.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.trade?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [allContractors, searchText]);

  const { mutate: postMutate } = usePost();

  const handleClose = () => {
    setSearchText('');
    onClose();
  };

  const handleSelect = async (contractor: Contractor) => {
    if (procurementIds && procurementIds.length > 0) {
      setIsSubmitting(true);
      try {
        await postMutate(
          {
            url: 'contractor_portal/bulk-share-procurements/',
            data: { contractor_id: contractor.id, procurement_ids: procurementIds },
          },
          {
            onSuccess: () => {
              toast.success(`Shared ${procurementIds.length} item${procurementIds.length > 1 ? 's' : ''} with ${contractor.name} ${contractor.surname}`);
              onSelect(contractor);
              handleClose();
              queryClient.refetchQueries({ queryKey: [`contractor_portal/project/${projectId}/contractors/`] });
            },
            onError: (error: any) => toast.error(error?.message || 'Failed to share procurements'),
            onSettled: () => setIsSubmitting(false),
          }
        );
      } catch {
        setIsSubmitting(false);
      }
    } else if (procurementId) {
      setIsSubmitting(true);
      try {
        await postMutate(
          {
            url: 'contractor_portal/share-procurement/',
            data: { contractor_id: contractor.id, procurement_id: procurementId },
          },
          {
            onSuccess: () => {
              toast.success(`Shared with ${contractor.name} ${contractor.surname}`);
              onSelect(contractor);
              handleClose();
            },
            onError: (error: any) => toast.error(error?.message || 'Failed to share procurement'),
            onSettled: () => setIsSubmitting(false),
          }
        );
      } catch {
        setIsSubmitting(false);
      }
    } else if (documentIds && documentIds.length > 0) {
      setIsSubmitting(true);
      try {
        await postMutate(
          {
            url: 'contractor_portal/bulk-share-documents/',
            data: {
              contractor_id: contractor.id,
              document_ids: documentIds,
              project_id: parseInt(projectId),
            },
          },
          {
            onSuccess: () => {
              toast.success(`Shared ${documentIds.length} document${documentIds.length > 1 ? 's' : ''} with ${contractor.name} ${contractor.surname}`);
              onSelect(contractor);
              handleClose();
            },
            onError: (error: any) => toast.error(error?.message || 'Failed to share documents'),
            onSettled: () => setIsSubmitting(false),
          }
        );
      } catch {
        setIsSubmitting(false);
      }
    } else if (documentId) {
      setIsSubmitting(true);
      try {
        await postMutate(
          {
            url: 'contractor_portal/share-document/',
            data: {
              contractor_id: contractor.id,
              document_id: documentId,
              project_id: parseInt(projectId),
            },
          },
          {
            onSuccess: () => {
              toast.success(`Shared with ${contractor.name} ${contractor.surname}`);
              onSelect(contractor);
              handleClose();
            },
            onError: (error: any) => toast.error(error?.message || 'Failed to share document'),
            onSettled: () => setIsSubmitting(false),
          }
        );
      } catch {
        setIsSubmitting(false);
      }
    } else {
      onSelect(contractor);
      handleClose();
    }
  };

  const getInitials = (c: Contractor) => {
    if (c.name && c.surname) return `${c.name[0]}${c.surname[0]}`.toUpperCase();
    if (c.name) return c.name[0].toUpperCase();
    if (c.company_name) return c.company_name[0].toUpperCase();
    return 'C';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-umber-600" />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 scrollbar scrollbar-thin">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : contractors.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                {t('empty')}
              </div>
            ) : (
              contractors.map(contractor => {
                const fullName = `${contractor.name} ${contractor.surname}`.trim();
                return (
                  <button
                    key={contractor.id}
                    onClick={() => handleSelect(contractor)}
                    disabled={isSubmitting}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-neutral-200 bg-white hover:border-umber-300 hover:bg-umber-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                        {getInitials(contractor)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {fullName || contractor.company_name}
                        </p>
                        {contractor.company_name && fullName && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 truncate mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contractor.company_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {contractor.email && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contractor.email}</span>
                          </div>
                        )}
                        {contractor.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{contractor.phone}</span>
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
      </DialogContent>
    </Dialog>
  );
}
