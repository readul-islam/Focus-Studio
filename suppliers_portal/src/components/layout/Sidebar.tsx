'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, LogOut, CreditCard, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutSupplier } from '@/hooks/useLogin';
import { useSupplierUser } from '@/hooks/useSupplierUser';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/payments', label: 'Payments', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { supplier } = useSupplierUser();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:flex md:flex-col">
      <div className="border-b px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Focuspilot</p>
        <p className="mt-1 text-sm font-semibold text-gray-900">Supplier Portal</p>
        {supplier?.company_name && (
          <p className="mt-2 truncate text-xs text-neutral-500">{supplier.company_name}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          type="button"
          onClick={logoutSupplier}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
