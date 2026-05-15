'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  FileText,
  Calendar,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Zap,
  Hammer,
  HardHat,
  MessageSquare,
} from 'lucide-react';
import type { TradeType } from '@/lib/contractor/types';

interface ContractorSidebarProps {
  projectId: string;
  token: string;
  trade: TradeType;
  contractorName: string;
  projectName: string;
  pendingDrawings?: number;
  unreadMessages?: number;
}

const TRADE_ICONS: Record<TradeType, typeof Wrench> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Joinery: Hammer,
  General: HardHat,
};

const TRADE_COLORS: Record<TradeType, string> = {
  Plumbing: 'bg-slatex-600',
  Electrical: 'bg-ochre-600',
  Joinery: 'bg-sage-600',
  General: 'bg-umber-700',
};

export function ContractorSidebar({
  projectId,
  token,
  trade,
  contractorName,
  projectName,
  pendingDrawings = 0,
  unreadMessages = 0,
}: ContractorSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const basePath = `/contractor/${projectId}/${token}`;
  const tradeParam = `?trade=${trade}`;

  const TradeIcon = TRADE_ICONS[trade];

  const navItems = [
    {
      label: 'Overview',
      href: basePath + tradeParam,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Items',
      href: `${basePath}/items${tradeParam}`,
      icon: Package,
    },
    {
      label: 'Drawings',
      href: `${basePath}/drawings${tradeParam}`,
      icon: FileText,
      badge: pendingDrawings > 0 ? pendingDrawings : undefined,
    },
    {
      label: 'Schedule',
      href: `${basePath}/schedule${tradeParam}`,
      icon: Calendar,
    },
    {
      label: 'Messages',
      href: `${basePath}/messages${tradeParam}`,
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    const pathWithoutQuery = pathname.split('?')[0];
    const hrefWithoutQuery = href.split('?')[0];

    if (exact) {
      return pathWithoutQuery === hrefWithoutQuery;
    }
    return pathWithoutQuery.startsWith(hrefWithoutQuery);
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-neutral-200 h-screen flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', TRADE_COLORS[trade])}>
            <TradeIcon className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {contractorName}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {trade === 'General' ? 'Builder / GC' : trade}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-xs text-neutral-400 mt-3 truncate">
            {projectName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    active
                      ? 'bg-stone-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-stone-50 hover:text-neutral-900'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-umber-700' : '')} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-terracotta-600 text-white text-xs px-1.5 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute right-1 top-1 w-2 h-2 bg-terracotta-600 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-neutral-200">
        <Link
          href={`${basePath}/help${tradeParam}`}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-500 hover:bg-stone-50 hover:text-neutral-700 transition-colors'
          )}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Help & Contact</span>}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-stone-50 hover:text-neutral-600 transition-colors mt-1"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Powered by */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            Powered by <span className="font-medium text-neutral-500">TechStyles</span>
          </p>
        </div>
      )}
    </aside>
  );
}