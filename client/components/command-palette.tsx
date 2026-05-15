'use client';

import * as React from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  LayoutDashboard, Inbox, CheckSquare, Calendar, FolderOpen,
  Users, BookOpen, DollarSign, BarChart2, Zap, HelpCircle,
  Settings, Contact, GitBranch, FileText, Package, Clock,
  User, Shield, Bell, Receipt, ShoppingCart, Activity,
  Search, ArrowRight, Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ReactNode;
  group: string;
  href: string;
  permission?: string;
};

// Permission keys mirror app-sidebar.tsx exactly
const NAV_COMMANDS: CommandItem[] = [
  // ── Navigation (personal) ──────────────────────────────────────────────────
  { id: 'dashboard',    label: 'Home',      description: 'Go to dashboard',   shortcut: 'hm', icon: <LayoutDashboard className="w-4 h-4" />, group: 'Navigation', href: '/home/dashboard' },
  { id: 'inbox',        label: 'Inbox',     description: 'View AI inbox',     shortcut: 'in', icon: <Inbox className="w-4 h-4" />,           group: 'Navigation', href: '/ai/inbox' },
  { id: 'tasks',        label: 'My Tasks',  description: 'View your tasks',   shortcut: 'mt', icon: <CheckSquare className="w-4 h-4" />,      group: 'Navigation', href: '/home/tasks',   permission: 'tasks.view' },
  { id: 'calendar',     label: 'Calendar',  description: 'Open calendar',     shortcut: 'ca', icon: <Calendar className="w-4 h-4" />,          group: 'Navigation', href: '/calendar' },
  { id: 'projects',     label: 'Projects',  description: 'All projects',      shortcut: 'pr', icon: <FolderOpen className="w-4 h-4" />,        group: 'Navigation', href: '/projects',     permission: 'projects.view' },

  // ── Studio ─────────────────────────────────────────────────────────────────
  { id: 'crm',              label: 'CRM',                      description: 'Contacts & pipeline',  shortcut: 'cr', icon: <Contact className="w-4 h-4" />,      group: 'Studio', href: '/crm/contacts',        permission: 'clients.view' },
  { id: 'crm-contacts',     label: 'CRM · Contacts',           description: 'View all contacts',    shortcut: 'cc', icon: <Users className="w-4 h-4" />,         group: 'Studio', href: '/crm/contacts',        permission: 'clients.view' },
  { id: 'crm-pipeline',     label: 'CRM · Pipeline',           description: 'Sales pipeline',       shortcut: 'cp', icon: <GitBranch className="w-4 h-4" />,     group: 'Studio', href: '/crm/pipeline',        permission: 'clients.view' },
  { id: 'crm-proposals',    label: 'CRM · Proposals',          description: 'Manage proposals',     shortcut: 'po', icon: <FileText className="w-4 h-4" />,      group: 'Studio', href: '/crm/proposals',       permission: 'clients.view' },
  { id: 'library',          label: 'Library',                  description: 'Products & materials', shortcut: 'li', icon: <BookOpen className="w-4 h-4" />,      group: 'Studio', href: '/library/products',    permission: 'library.view' },
  { id: 'library-products', label: 'Library · Products',       description: 'Browse products',      shortcut: 'lp', icon: <Package className="w-4 h-4" />,       group: 'Studio', href: '/library/products',    permission: 'library.view' },
  { id: 'library-materials',label: 'Library · Materials',      description: 'Browse materials',     shortcut: 'lm', icon: <Package className="w-4 h-4" />,       group: 'Studio', href: '/library/materials',   permission: 'library.view' },
  { id: 'teams',            label: 'Team',                     description: 'Team management',      shortcut: 'tm', icon: <Users className="w-4 h-4" />,          group: 'Studio', href: '/teams',               permission: 'team.view' },
  { id: 'finance',          label: 'Finance',                  description: 'Finance overview',     shortcut: 'fi', icon: <DollarSign className="w-4 h-4" />,    group: 'Studio', href: '/finance',              permission: 'finance.view' },
  { id: 'finance-invoices', label: 'Finance · Invoices',       description: 'Manage invoices',      shortcut: 'fv', icon: <Receipt className="w-4 h-4" />,       group: 'Studio', href: '/finance/invoices',    permission: 'finance.view' },
  { id: 'finance-po',       label: 'Finance · Purchase Orders',description: 'Purchase orders',      shortcut: 'fp', icon: <ShoppingCart className="w-4 h-4" />,  group: 'Studio', href: '/finance/purchase-order', permission: 'finance.view' },
  { id: 'reports',          label: 'Reports',                  description: 'Analytics & reports',  shortcut: 're', icon: <BarChart2 className="w-4 h-4" />,     group: 'Studio', href: '/reports/overview',    permission: 'reports.view' },
  { id: 'reports-projects', label: 'Reports · Projects',       description: 'Project reports',      shortcut: 'rp', icon: <FolderOpen className="w-4 h-4" />,    group: 'Studio', href: '/reports/projects',    permission: 'reports.view' },
  { id: 'reports-team',     label: 'Reports · Team',           description: 'Team performance',     shortcut: 'rt', icon: <Users className="w-4 h-4" />,          group: 'Studio', href: '/reports/team',        permission: 'reports.view' },
  { id: 'reports-finance',  label: 'Reports · Finance',        description: 'Financial reports',    shortcut: 'rf', icon: <DollarSign className="w-4 h-4" />,    group: 'Studio', href: '/reports/finance',     permission: 'reports.view' },
  { id: 'ai-activity',      label: 'AI Activity',              description: 'AI usage log',         shortcut: 'aa', icon: <Zap className="w-4 h-4" />,            group: 'Studio', href: '/ai/activity' },
  { id: 'daily-brief',      label: 'Daily Brief',              description: 'AI daily summary',     shortcut: 'db', icon: <Activity className="w-4 h-4" />,       group: 'Studio', href: '/ai/daily-brief' },

  // ── Productivity ───────────────────────────────────────────────────────────
  { id: 'time-tracking', label: 'Time Tracking', description: 'View time logs', shortcut: 'tt', icon: <Clock className="w-4 h-4" />, group: 'Productivity', href: '/home/time' },

  // ── Settings — user (accessible to all) ───────────────────────────────────
  { id: 'settings-profile',       label: 'Profile Settings',        description: 'Edit your profile',     shortcut: 'sp', icon: <User className="w-4 h-4" />,     group: 'Settings', href: '/settings/user/profile' },
  { id: 'settings-security',      label: 'Security Settings',       description: 'Password & 2FA',        shortcut: 'ss', icon: <Shield className="w-4 h-4" />,   group: 'Settings', href: '/settings/user/security' },
  { id: 'settings-notifications', label: 'Notification Settings',   description: 'Alert preferences',     shortcut: 'sn', icon: <Bell className="w-4 h-4" />,     group: 'Settings', href: '/settings/user/notifications' },
  { id: 'settings-time',          label: 'Time Tracking Settings',  description: 'Time tracker config',   shortcut: 'st', icon: <Clock className="w-4 h-4" />,    group: 'Settings', href: '/settings/user/time-tracking' },
  // ── Settings — studio (gated by settings.view) ────────────────────────────
  { id: 'settings-studio',        label: 'Studio Settings',         description: 'Workspace config',      shortcut: 'sg', icon: <Settings className="w-4 h-4" />, group: 'Settings', href: '/settings/studio/general',       permission: 'settings.view' },
  { id: 'settings-team',          label: 'Team Settings',           description: 'Manage team members',   shortcut: 'sw', icon: <Users className="w-4 h-4" />,    group: 'Settings', href: '/settings/studio/team',          permission: 'settings.view' },
  { id: 'settings-roles',         label: 'Roles & Permissions',     description: 'Access control',        shortcut: 'sr', icon: <Shield className="w-4 h-4" />,   group: 'Settings', href: '/settings/studio/roles',         permission: 'settings.view' },
  { id: 'settings-integrations',  label: 'Integrations',            description: 'Connect external apps', shortcut: 'si', icon: <Zap className="w-4 h-4" />,      group: 'Settings', href: '/settings/studio/integrations',  permission: 'settings.view' },

  // ── Help ───────────────────────────────────────────────────────────────────
  { id: 'help', label: 'Help Center', description: 'Documentation & guides', shortcut: 'he', icon: <HelpCircle className="w-4 h-4" />, group: 'Help', href: '/help' },
];

const GROUP_ORDER = ['Navigation', 'Studio', 'Productivity', 'Settings', 'Help'];

function scoreMatch(item: CommandItem, query: string): number {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const shortcut = (item.shortcut || '').toLowerCase();

  if (shortcut === q) return 100;
  if (label === q) return 90;
  if (label.startsWith(q)) return 80;
  if (shortcut.startsWith(q)) return 75;
  if (label.includes(q)) return 60;
  if (desc.includes(q)) return 40;
  return 0;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allowed = useMemo(
    () => NAV_COMMANDS.filter(item => !item.permission || can(item.permission)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [can],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allowed;
    const q = query.trim();
    return allowed
      .map(item => ({ item, score: scoreMatch(item, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [query, allowed]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const g = map.get(item.group) || [];
      g.push(item);
      map.set(item.group, g);
    }
    return GROUP_ORDER
      .filter(g => map.has(g))
      .map(g => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback((item: CommandItem) => {
    router.push(item.href);
    onClose();
    setQuery('');
  }, [router, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) navigate(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, activeIndex, navigate, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  let flatIndex = 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[99] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          aria-label="Command palette"
          className={cn(
            'fixed left-1/2 top-[20%] z-[100] w-full max-w-[700px] -translate-x-1/2',
            'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
          )}
        >
          {/* Hidden title for a11y */}
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search or run a command..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[420px] overflow-y-auto overscroll-contain py-2">
            {grouped.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {grouped.map(({ group, items }) => (
              <div key={group}>
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group}
                  </span>
                </div>
                {items.map(item => {
                  const idx = flatIndex++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-75',
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <span className={cn('flex-shrink-0', isActive ? 'text-gray-700' : 'text-gray-400')}>
                        {item.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-normal truncate">{item.label}</span>
                        {/* {item.description && (
                          <span className="block text-xs text-gray-400 truncate">{item.description}</span>
                        )} */}
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        {item.shortcut && (
                          <kbd className="text-[11px] font-mono text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            {item.shortcut}
                          </kbd>
                        )}
                        {isActive && <ArrowRight className="w-3.5 h-3.5 text-gray-400" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="font-mono bg-white border border-gray-200 px-1 py-0.5 rounded text-[10px]">↑</kbd>
              <kbd className="font-mono bg-white border border-gray-200 px-1 py-0.5 rounded text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">esc</kbd>
              Close
            </span>
            <span className="ml-auto text-[11px] text-gray-400">
              Type shortcut &amp; press <kbd className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> to jump
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
