'use client';

import { PermissionGuard } from '@/components/PermissionGuard';
import { FinanceListView } from '@/components/finance/finance-list-view';

export default function PurchaseOrdersPage() {
  return (
    <PermissionGuard permission="finance.view">
      <FinanceListView mode="purchase-orders" />
    </PermissionGuard>
  );
}
