'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { User, Clock, Settings, DollarSign, Puzzle, Users, LucideIcon, Shield, Bell, FileText, ShieldCheck } from 'lucide-react';

type Item = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const userItems: Item[] = [
  { label: 'Profile', href: '/settings/user/profile', icon: User },
  { label: 'Security', href: '/settings/user/security', icon: Shield },
  { label: 'Notifications', href: '/settings/user/notifications', icon: Bell },
  { label: 'Time Tracking', href: '/settings/user/time-tracking', icon: Clock },
];

const studioItems: Item[] = [
  { label: 'General', href: '/settings/studio/general', icon: Settings },
  { label: 'Finance', href: '/settings/studio/finance', icon: DollarSign },
  { label: 'Team', href: '/settings/studio/team', icon: Users },
  { label: 'Roles & Permissions', href: '/settings/studio/roles', icon: ShieldCheck },
  { label: 'Templates', href: '/settings/studio/templates', icon: FileText },
  { label: 'Integrations', href: '/settings/studio/integrations', icon: Puzzle },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      <div className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      <nav className="grid gap-1">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                active ? 'bg-stone-100 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-stone-50'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function TabItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap rounded-md transition-colors shrink-0',
        active ? 'bg-stone-100 text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-stone-50'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <item.icon className="size-3.5" />
      {item.label}
    </Link>
  );
}

export default function SettingsSidebar() {
  const { can } = usePermissions();
  const canEditSettings = can('settings.edit');

  const visibleStudioItems = canEditSettings
    ? studioItems.filter(item => item.href !== '/settings/studio/roles' || canEditSettings)
    : [];

  const allItems = [
    ...userItems,
    ...(visibleStudioItems.length > 0 ? visibleStudioItems : []),
  ];

  return (
    <>
      {/* Mobile / tablet: horizontal scrollable tab bar */}
      <div className="lg:hidden w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-gray-100 bg-white rounded-lg">
        <div className="flex items-center gap-1 p-2">
          {allItems.map(item => (
            <TabItem key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:block h-full w-full overflow-y-auto p-2">
        <Section title="User" items={userItems} />
        {visibleStudioItems.length > 0 && (
          <>
            <div className="my-2 border-t" />
            <Section title="Studio" items={visibleStudioItems} />
          </>
        )}
      </div>
    </>
  );
}