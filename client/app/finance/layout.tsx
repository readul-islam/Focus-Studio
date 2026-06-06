'use client';

import { usePathname } from 'next/navigation';
import { FinanceSubNav } from '@/components/finance/finance-sub-nav';

function shouldShowFinanceSubNav(pathname: string) {
  if (pathname.startsWith('/finance/stripe-connect')) return false;
  if (pathname === '/finance') return true;
  if (pathname === '/finance/invoices') return true;
  if (pathname === '/finance/purchase-order') return true;
  return false;
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSubNav = shouldShowFinanceSubNav(pathname);

  if (!showSubNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FinanceSubNav />
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
