'use client';

import Link from 'next/link';
import { Armchair } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/chip';
import { cn } from '@/lib/utils';

export type InvoicePreviewLineItem = {
  id?: number | string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax?: string;
  showThumbnail?: boolean;
};

type InvoicePreviewShowcaseProps = {
  invoiceNumber: string;
  clientName: string;
  lineItems: InvoicePreviewLineItem[];
  isDemo?: boolean;
  canEdit?: boolean;
  continueHref?: string;
  caption?: string;
  className?: string;
};

function formatMoney(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function InvoicePreviewShowcase({
  invoiceNumber,
  clientName,
  lineItems,
  isDemo = false,
  canEdit = false,
  continueHref,
  caption,
  className,
}: InvoicePreviewShowcaseProps) {
  const t = useTranslations('financeInvoicesHero');

  return (
    <div className={cn('relative mx-auto w-full max-w-4xl', className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5 ring-1 ring-border/60 dark:shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            {caption ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{caption}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{invoiceNumber}</h3>
              <StatusBadge status="DFT" label={t('draftBadge')} />
            </div>
            <p className="text-sm text-muted-foreground">{clientName}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium sm:px-6">{t('columns.description')}</th>
                <th className="w-16 px-3 py-3 text-center font-medium">{t('columns.qty')}</th>
                <th className="w-28 px-3 py-3 text-right font-medium">{t('columns.amount')}</th>
                <th className="w-24 px-3 py-3 font-medium">{t('columns.tax')}</th>
                <th className="w-28 px-5 py-3 text-right font-medium sm:px-6">{t('columns.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lineItems.map((item, index) => (
                <tr key={item.id ?? index} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5 text-foreground sm:px-6">
                    <div className="flex items-center gap-3">
                      {item.showThumbnail ? (
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50"
                          aria-hidden
                        >
                          <Armchair className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                      ) : null}
                      <span className="leading-snug">{item.description}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center tabular-nums text-muted-foreground">{item.quantity}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground">
                    {formatMoney(item.unit_price)}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground">
                      {item.tax || t('demo.taxLabel')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground sm:px-6">
                    {formatMoney(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isDemo && canEdit && continueHref ? (
          <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={continueHref}>{t('continueEditing')}</Link>
            </Button>
          </div>
        ) : null}

        {isDemo ? (
          <div className="border-t border-border bg-muted/10 px-5 py-3 sm:px-6">
            <p className="text-center text-xs text-muted-foreground">{t('demo.hint')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function useDemoInvoicePreview() {
  const t = useTranslations('financeInvoicesHero.demo');

  const lineItems: InvoicePreviewLineItem[] = [
    {
      description: t('line1'),
      quantity: 1,
      unit_price: 1250,
      total: 1250,
      tax: t('taxLabel'),
    },
    {
      description: t('line2'),
      quantity: 1,
      unit_price: 8000,
      total: 8000,
      tax: t('taxLabel'),
    },
    {
      description: t('line3'),
      quantity: 1,
      unit_price: 2450,
      total: 2450,
      tax: t('taxLabel'),
      showThumbnail: true,
    },
  ];

  return {
    invoiceNumber: t('invoiceNumber'),
    clientName: t('clientName'),
    lineItems,
  };
}
