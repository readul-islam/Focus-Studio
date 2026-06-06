'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { FileText, ShoppingCart } from 'lucide-react';

const tabs = [
  { href: '/finance/invoices', labelKey: 'invoices' as const, icon: FileText },
  { href: '/finance/purchase-order', labelKey: 'purchaseOrders' as const, icon: ShoppingCart },
];

export function FinanceSubNav() {
  const pathname = usePathname();
  const t = useTranslations('financeNav');

  return (
    <nav aria-label={t('ariaLabel')} className="flex items-center gap-1 border-b border-border pb-px">
      {tabs.map(({ href, labelKey, icon: Icon }) => {
        const isActive =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (href === '/finance/invoices' && pathname === '/finance');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
