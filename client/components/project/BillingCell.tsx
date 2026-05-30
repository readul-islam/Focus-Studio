'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BillingStatusDots = React.memo(({
  invoiceId,
  invoiceSentAt,
  clientPaidAt,
}: {
  invoiceId: string | null;
  invoiceSentAt: string | null;
  clientPaidAt: string | null;
}) => {
  const t = useTranslations('projectProcurementCells');
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title={t('invoiceCreatedTitle')}>
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', invoiceId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">{t('poCreated')}</span>
      </div>
      <div className="flex items-center gap-1" title={t('invoiceSentTitle')}>
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            invoiceSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">{t('poSent')}</span>
      </div>
      <div className="flex items-center gap-1" title={t('clientPaidTitle')}>
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            clientPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">{t('poPaid')}</span>
      </div>
    </div>
  );
});

BillingStatusDots.displayName = 'BillingStatusDots';

interface BillingCellProps {
  item: any;
  loadingProductIdForInv: string | null;
  clickHandleInvoice: () => void;
  procurementPermission: boolean;
}

const BillingCell = React.memo<BillingCellProps>(({ item, loadingProductIdForInv, clickHandleInvoice, procurementPermission }) => {
  const t = useTranslations('projectProcurementCells');

  // ------------------------
  // CASE: No invoice exists → show “Create invoice”
  // ------------------------
  if (!item?.inv_created || !item.invoice) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          disabled={loadingProductIdForInv === item.po || !item?.po_created || !procurementPermission}
          variant="ghost"
          title={t('createInvoice')}
          size="sm"
          onClick={clickHandleInvoice}
          className="h-8 text-sm  px-0 hover:bg-transparent whitespace-nowrap w-fit text-neutral-800"
        >
          {loadingProductIdForInv === item.po && item.po ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('creating')}
            </div>
          ) : (
            t('createInvoice')
          )}
        </Button>
      </div>
    );
  }

  // ------------------------
  // CASE: Invoice exists → Show invoice details
  // ------------------------
  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary hover:underline text-left whitespace-nowrap">
        {item?.display_invoice}
      </button>

      <BillingStatusDots invoiceId={item?.inv_created} invoiceSentAt={item?.inv_sent} clientPaidAt={item?.inv_received} />
    </div>
  );
});

BillingCell.displayName = 'BillingCell';

export default BillingCell;

