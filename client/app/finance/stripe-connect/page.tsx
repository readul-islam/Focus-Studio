'use client';

import { PermissionGuard } from '@/components/PermissionGuard';
import { StripeConnectFlow } from '@/components/finance/stripe-connect-flow';

export default function StripeConnectPage() {
  return (
    <PermissionGuard permission="finance.view" redirectTo="/finance/invoices">
      <StripeConnectFlow />
    </PermissionGuard>
  );
}
