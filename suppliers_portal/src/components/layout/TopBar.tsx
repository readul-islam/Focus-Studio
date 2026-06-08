'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupplierUser } from '@/hooks/useSupplierUser';

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
];

export function TopBar() {
  const { supplier } = useSupplierUser();

  return (
    <header className="border-b bg-white px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 md:hidden">Supplier Portal</p>
          <h1 className="text-lg font-semibold text-gray-900">{supplier?.company_name ?? 'Supplier'}</h1>
        </div>
        {supplier?.is_verified ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Verified</span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Pending verification</span>
        )}
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
      <div className="grid grid-cols-3">
        {mobileNav.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-xs font-medium',
                active ? 'text-neutral-900' : 'text-neutral-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
