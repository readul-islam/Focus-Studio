'use client';

import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePost } from '@/hooks/usePost';
import { isCatalogProcurement } from '@/lib/procurement-product';
import { gooeyToast as toast } from 'goey-toast';

type PaySupplierButtonProps = {
  item: {
    id: number;
    supplier_payment_status?: string | null;
    catalog_product?: unknown;
    is_from_catalog?: boolean;
  };
};

export function PaySupplierButton({ item }: PaySupplierButtonProps) {
  const isCatalog = isCatalogProcurement(item);
  const isPaid = item.supplier_payment_status === 'paid';

  const { mutate: startCheckout, isPending } = usePost<{ url: string }>({
    onSuccess: response => {
      if (response?.url) {
        window.location.href = response.url;
      }
    },
    onError: error => {
      const detail =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      toast.error(detail || 'Could not start supplier payment.');
    },
  });

  if (!isCatalog || isPaid) {
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
        startCheckout({
          url: 'supplier_portal/studio/payments/checkout/',
          data: { procurement_id: item.id },
        })
      }
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
      Pay supplier
    </Button>
  );
}
