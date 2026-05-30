'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POStatusDots = React.memo(({ poId, poSentAt, supplierPaidAt }: { poId: string | null; poSentAt: string | null; supplierPaidAt: string | null }) => {
  const t = useTranslations('projectProcurementCells');
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title={t('poCreatedTitle')}>
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">{t('poCreated')}</span>
      </div>
      <div className="flex items-center gap-1" title={t('poSentTitle')}>
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">{t('poSent')}</span>
      </div>
      <div className="flex items-center gap-1" title={t('supplierPaidTitle')}>
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            supplierPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">{t('poPaid')}</span>
      </div>
    </div>
  );
});

POStatusDots.displayName = 'POStatusDots';

interface POCellProps {
  item: any;
  loadingProductId: string | null;
  handleClickPO: () => void;
}

const POCell = React.memo<POCellProps>(({ item, loadingProductId, handleClickPO, procurementPermission }) => {
  const t = useTranslations('projectProcurementCells');

    // -------------------------
  // Case 1: No PO exists yet
  // -------------------------
  if (!item?.po_created || !item.po) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          title={t('createPo')}
          disabled={loadingProductId === item.id || !item?.supplier || item.client_approval !== 'APR' || !procurementPermission}
          onClick={handleClickPO}
          className={cn(
            'h-8 px-2 disabled:cursor-not-allowed disabled:opacity-100 text-sm whitespace-nowrap px-0 hover:bg-transparent w-fit',
            item?.supplier && item.client_approval === 'APR'
              ? 'text-primary'
              : 'text-neutral-400 cursor-not-allowed',
            loadingProductId === item.id && 'cursor-wait opacity-70'
          )}
        >
          {loadingProductId === item.id ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('creating')}
            </div>
          ) : (
            t('createPo')
          )}
        </Button>
      </div>
    );
  }

  // -------------------------
  // Case 2: PO exists → show details
  // -------------------------
  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary font-normal hover:underline text-left whitespace-nowrap">
        {item?.display_po}
      </button>

      <POStatusDots poId={item?.po_created} poSentAt={item?.po_sent} supplierPaidAt={item?.po_received} />
    </div>
  );
});

POCell.displayName = 'POCell';

export default POCell;
