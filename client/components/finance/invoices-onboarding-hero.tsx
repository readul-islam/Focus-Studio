'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StripePaymentsSetup } from './stripe-payments-setup';
import {
  InvoicePreviewShowcase,
  useDemoInvoicePreview,
  type InvoicePreviewLineItem,
} from './invoice-preview-showcase';

type DraftInvoice = {
  id: number;
  display_invoice?: string;
  client?: { name?: string; company_name?: string };
  line_items?: Array<{
    id?: number;
    description: string;
    quantity: number;
    unit_price: string | number;
    total?: string | number;
  }>;
};

type Props = {
  canEdit: boolean;
  draftInvoice?: DraftInvoice | null;
};

function mapDraftLineItems(
  items: DraftInvoice['line_items'],
  taxLabel: string
): InvoicePreviewLineItem[] {
  return (items || []).slice(0, 5).map((item, index) => {
    const unitPrice = Number(item.unit_price) || 0;
    const total = Number(item.total ?? unitPrice * item.quantity) || 0;
    return {
      id: item.id ?? index,
      description: item.description,
      quantity: item.quantity,
      unit_price: unitPrice,
      total,
      tax: taxLabel,
    };
  });
}

export function InvoicesOnboardingHero({ canEdit, draftInvoice }: Props) {
  const t = useTranslations('financeInvoicesHero');
  const demo = useDemoInvoicePreview();

  const hasDraft = Boolean(draftInvoice?.line_items?.length);
  const preview = hasDraft
    ? {
        invoiceNumber: draftInvoice!.display_invoice || t('draftNumber'),
        clientName:
          draftInvoice!.client?.company_name ||
          draftInvoice!.client?.name ||
          t('noClient'),
        lineItems: mapDraftLineItems(draftInvoice!.line_items, t('demo.taxLabel')),
        isDemo: false as const,
        caption: t('previewLabel'),
        continueHref: `/finance/invoices/${draftInvoice!.id}`,
      }
    : {
        invoiceNumber: demo.invoiceNumber,
        clientName: demo.clientName,
        lineItems: demo.lineItems,
        isDemo: true as const,
        caption: undefined,
        continueHref: undefined,
      };

  return (
    <div className="overflow-x-hidden">
      <div className="mx-auto max-w-2xl pt-2 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40">
          <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('title')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('description')}{' '}
          <Link
            href="/help/finance/invoicing"
            className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/80"
          >
            {t('learnMore')}
          </Link>
        </p>

        {canEdit && (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <StripePaymentsSetup />
            <Button variant="outline" asChild>
              <Link href="/finance/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('createInvoice')}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <InvoicePreviewShowcase
        className="mt-16 sm:mt-20 lg:mt-24"
        invoiceNumber={preview.invoiceNumber}
        clientName={preview.clientName}
        lineItems={preview.lineItems}
        isDemo={preview.isDemo}
        canEdit={canEdit}
        continueHref={preview.continueHref}
        caption={preview.caption}
      />
    </div>
  );
}
