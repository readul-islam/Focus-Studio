'use client';

import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePost } from '@/hooks/usePost';
import { isCatalogProcurement } from '@/lib/procurement-product';
import { gooeyToast as toast } from 'goey-toast';
import { useQueryClient } from '@tanstack/react-query';

type RequestQuoteButtonProps = {
  item: {
    id: number;
    catalog_product?: unknown;
    is_from_catalog?: boolean;
    quote_status?: string | null;
    status?: string | null;
  };
  projectId: number | string;
};

export function RequestQuoteButton({ item, projectId }: RequestQuoteButtonProps) {
  const queryClient = useQueryClient();
  const isCatalog = isCatalogProcurement(item);
  const quotePending = item.quote_status === 'RQ';
  const quoteReceived = item.quote_status === 'QT';
  const alreadyQuotedFlow = item.status === 'QT' || quotePending || quoteReceived;

  const { mutate: requestQuote, isPending } = usePost<{ message: string }>({
    onSuccess: response => {
      toast.success(response?.message || 'Quote request sent to supplier.');
      queryClient.invalidateQueries({
        queryKey: [`projects/project-procurements/?project_id=${projectId}`],
      });
    },
    onError: error => {
      const detail =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      toast.error(detail || 'Could not request quote.');
    },
  });

  if (!isCatalog || alreadyQuotedFlow) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      disabled={isPending}
      onClick={() =>
        requestQuote({
          url: 'supplier_portal/studio/quotes/request/',
          data: { procurement_id: item.id },
        })
      }
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      Request quote
    </Button>
  );
}
