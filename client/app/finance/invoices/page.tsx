'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FinanceListView } from '@/components/finance/finance-list-view';

function InvoicesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const stripe = searchParams.get('stripe');
    if (stripe === 'return') {
      router.replace('/finance/stripe-connect?return=1');
    } else if (stripe === 'refresh') {
      router.replace('/finance/stripe-connect?refresh=1');
    }
  }, [router, searchParams]);

  return <FinanceListView mode="invoices" />;
}

export default function InvoicesPage() {
  return (
    <PermissionGuard permission="finance.view">
      <InvoicesPageContent />
    </PermissionGuard>
  );
}
