'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';
import { User, Clock, Settings, DollarSign, Puzzle, Users, LucideIcon, Shield, Bell, FileText, ShieldCheck, CreditCard, Webhook, Palette, Globe } from 'lucide-react';

type Item = {
  label: string;
  href: string;
  icon: LucideIcon;
};

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
                active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
        active ? 'bg-accent text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <item.icon className="size-3.5" />
      {item.label}
    </Link>
  );
}

export default function SettingsSidebar() {
  const t = useTranslations('settingsNav');
  const { can } = usePermissions();
  const canEditSettings = can('settings.edit');
  const userItems: Item[] = [
    { label: t('profile'), href: '/settings/user/profile', icon: User },
    { label: t('security'), href: '/settings/user/security', icon: Shield },
    { label: t('notifications'), href: '/settings/user/notifications', icon: Bell },
    { label: t('appearance'), href: '/settings/user/appearance', icon: Palette },
    { label: t('timeTracking'), href: '/settings/user/time-tracking', icon: Clock },
  ];

  const studioItems: Item[] = [
    { label: t('general'), href: '/settings/studio/general', icon: Settings },
    { label: t('publicProfile'), href: '/settings/studio/public-profile', icon: Globe },
    { label: t('upgradePlan'), href: '/settings/studio/billing', icon: CreditCard },
    { label: t('finance'), href: '/settings/studio/finance', icon: DollarSign },
    { label: t('team'), href: '/settings/studio/team', icon: Users },
    { label: t('rolesPermissions'), href: '/settings/studio/roles', icon: ShieldCheck },
    { label: t('templates'), href: '/settings/studio/templates', icon: FileText },
    { label: t('integrations'), href: '/settings/studio/integrations', icon: Puzzle },
    { label: t('apiWebhooks'), href: '/settings/studio/api', icon: Webhook },
  ];

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
      <div className="lg:hidden w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-border bg-card rounded-lg">
        <div className="flex items-center gap-1 p-2">
          {allItems.map(item => (
            <TabItem key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden lg:block h-full w-full overflow-y-auto p-2">
        <Section title={t('userSection')} items={userItems} />
        {visibleStudioItems.length > 0 && (
          <>
            <div className="my-2 border-t" />
            <Section title={t('studioSection')} items={visibleStudioItems} />
          </>
        )}
      </div>
    </>
  );
}