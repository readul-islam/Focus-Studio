'use client';

import * as React from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  LayoutDashboard, Inbox, CheckSquare, Calendar, FolderOpen,
  Users, BookOpen, DollarSign, BarChart2, Zap, HelpCircle, Palette,
  Settings, Contact, GitBranch, FileText, Package, Clock,
  User, Shield, Bell, Receipt, ShoppingCart, Activity,
  Search, ArrowRight, Hash, Presentation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';

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

const GROUP_ORDER_KEYS = ['navigation', 'studio', 'productivity', 'settings', 'help'] as const;

function useNavCommands(): CommandItem[] {
  const tNav = useTranslations('navigation.sidebar');
  const tSet = useTranslations('settingsNav');
  const tRep = useTranslations('reportsPage');
  const tCmd = useTranslations('commandPalette');
  const g = (key: (typeof GROUP_ORDER_KEYS)[number]) => tCmd(`groups.${key}`);

  return [
    { id: 'dashboard', label: tNav('home'), description: tCmd('items.dashboardDesc'), shortcut: 'hm', icon: <LayoutDashboard className="w-4 h-4" />, group: g('navigation'), href: '/home/dashboard' },
    { id: 'inbox', label: tNav('inbox'), description: tCmd('items.inboxDesc'), shortcut: 'in', icon: <Inbox className="w-4 h-4" />, group: g('navigation'), href: '/ai/inbox' },
    { id: 'tasks', label: tNav('myTasks'), description: tCmd('items.tasksDesc'), shortcut: 'mt', icon: <CheckSquare className="w-4 h-4" />, group: g('navigation'), href: '/home/tasks', permission: 'tasks.view' },
    { id: 'calendar', label: tNav('calendar'), description: tCmd('items.calendarDesc'), shortcut: 'ca', icon: <Calendar className="w-4 h-4" />, group: g('navigation'), href: '/calendar' },
    { id: 'projects', label: tNav('projects'), description: tCmd('items.projectsDesc'), shortcut: 'pr', icon: <FolderOpen className="w-4 h-4" />, group: g('navigation'), href: '/projects', permission: 'projects.view' },
    { id: 'presentations', label: tNav('presentations'), description: tCmd('items.presentationsDesc'), shortcut: 'pe', icon: <Presentation className="w-4 h-4" />, group: g('navigation'), href: '/presentations', permission: 'presentations.view' },
    { id: 'crm', label: tNav('crm'), description: tCmd('items.crmDesc'), shortcut: 'cr', icon: <Contact className="w-4 h-4" />, group: g('studio'), href: '/crm/contacts', permission: 'clients.view' },
    { id: 'crm-contacts', label: tCmd('items.crmContactsLabel'), description: tCmd('items.crmContactsDesc'), shortcut: 'cc', icon: <Users className="w-4 h-4" />, group: g('studio'), href: '/crm/contacts', permission: 'clients.view' },
    { id: 'crm-pipeline', label: tCmd('items.crmPipelineLabel'), description: tCmd('items.crmPipelineDesc'), shortcut: 'cp', icon: <GitBranch className="w-4 h-4" />, group: g('studio'), href: '/crm/pipeline', permission: 'clients.view' },
    { id: 'crm-proposals', label: tCmd('items.crmProposalsLabel'), description: tCmd('items.crmProposalsDesc'), shortcut: 'po', icon: <FileText className="w-4 h-4" />, group: g('studio'), href: '/crm/proposals', permission: 'clients.view' },
    { id: 'library', label: tNav('library'), description: tCmd('items.libraryDesc'), shortcut: 'li', icon: <BookOpen className="w-4 h-4" />, group: g('studio'), href: '/library/products', permission: 'library.view' },
    { id: 'library-products', label: tCmd('items.libraryProductsLabel'), description: tCmd('items.libraryProductsDesc'), shortcut: 'lp', icon: <Package className="w-4 h-4" />, group: g('studio'), href: '/library/products', permission: 'library.view' },
    { id: 'library-materials', label: tCmd('items.libraryMaterialsLabel'), description: tCmd('items.libraryMaterialsDesc'), shortcut: 'lm', icon: <Package className="w-4 h-4" />, group: g('studio'), href: '/library/materials', permission: 'library.view' },
    { id: 'teams', label: tNav('team'), description: tCmd('items.teamsDesc'), shortcut: 'tm', icon: <Users className="w-4 h-4" />, group: g('studio'), href: '/teams', permission: 'team.view' },
    { id: 'finance', label: tNav('finance'), description: tCmd('items.financeDesc'), shortcut: 'fi', icon: <DollarSign className="w-4 h-4" />, group: g('studio'), href: '/finance/invoices', permission: 'finance.view' },
    { id: 'finance-invoices', label: tCmd('items.financeInvoicesLabel'), description: tCmd('items.financeInvoicesDesc'), shortcut: 'fv', icon: <Receipt className="w-4 h-4" />, group: g('studio'), href: '/finance/invoices', permission: 'finance.view' },
    { id: 'finance-po', label: tCmd('items.financePoLabel'), description: tCmd('items.financePoDesc'), shortcut: 'fp', icon: <ShoppingCart className="w-4 h-4" />, group: g('studio'), href: '/finance/purchase-order', permission: 'finance.view' },
    { id: 'design', label: tNav('design'), description: tCmd('items.designDesc'), shortcut: 'ds', icon: <Palette className="w-4 h-4" />, group: g('studio'), href: '/design', permission: 'design.view' },
    { id: 'reports', label: tRep('title'), description: tCmd('items.reportsDesc'), shortcut: 're', icon: <BarChart2 className="w-4 h-4" />, group: g('studio'), href: '/reports/overview', permission: 'reports.view' },
    { id: 'reports-projects', label: tCmd('items.reportsProjectsLabel'), description: tCmd('items.reportsProjectsDesc'), shortcut: 'rp', icon: <FolderOpen className="w-4 h-4" />, group: g('studio'), href: '/reports/projects', permission: 'reports.view' },
    { id: 'reports-team', label: tCmd('items.reportsTeamLabel'), description: tCmd('items.reportsTeamDesc'), shortcut: 'rt', icon: <Users className="w-4 h-4" />, group: g('studio'), href: '/reports/team', permission: 'reports.view' },
    { id: 'reports-finance', label: tCmd('items.reportsFinanceLabel'), description: tCmd('items.reportsFinanceDesc'), shortcut: 'rf', icon: <DollarSign className="w-4 h-4" />, group: g('studio'), href: '/reports/finance', permission: 'reports.view' },
    { id: 'ai-activity', label: tNav('aiActivity'), description: tCmd('items.aiActivityDesc'), shortcut: 'aa', icon: <Zap className="w-4 h-4" />, group: g('studio'), href: '/ai/activity' },
    { id: 'daily-brief', label: tCmd('items.dailyBriefLabel'), description: tCmd('items.dailyBriefDesc'), shortcut: 'db', icon: <Activity className="w-4 h-4" />, group: g('studio'), href: '/ai/daily-brief' },
    { id: 'time-tracking', label: tSet('timeTracking'), description: tCmd('items.timeTrackingDesc'), shortcut: 'tt', icon: <Clock className="w-4 h-4" />, group: g('productivity'), href: '/home/time' },
    { id: 'settings-profile', label: tCmd('items.settingsProfileLabel'), description: tCmd('items.settingsProfileDesc'), shortcut: 'sp', icon: <User className="w-4 h-4" />, group: g('settings'), href: '/settings/user/profile' },
    { id: 'settings-security', label: tCmd('items.settingsSecurityLabel'), description: tCmd('items.settingsSecurityDesc'), shortcut: 'ss', icon: <Shield className="w-4 h-4" />, group: g('settings'), href: '/settings/user/security' },
    { id: 'settings-notifications', label: tCmd('items.settingsNotificationsLabel'), description: tCmd('items.settingsNotificationsDesc'), shortcut: 'sn', icon: <Bell className="w-4 h-4" />, group: g('settings'), href: '/settings/user/notifications' },
    { id: 'settings-time', label: tCmd('items.settingsTimeLabel'), description: tCmd('items.settingsTimeDesc'), shortcut: 'st', icon: <Clock className="w-4 h-4" />, group: g('settings'), href: '/settings/user/time-tracking' },
    { id: 'settings-studio', label: tCmd('items.settingsStudioLabel'), description: tCmd('items.settingsStudioDesc'), shortcut: 'sg', icon: <Settings className="w-4 h-4" />, group: g('settings'), href: '/settings/studio/general', permission: 'settings.view' },
    { id: 'settings-public-profile', label: tSet('publicProfile'), description: tCmd('items.settingsPublicProfileDesc'), shortcut: 's2', icon: <Settings className="w-4 h-4" />, group: g('settings'), href: '/settings/studio/public-profile', permission: 'settings.edit' },
    { id: 'settings-team', label: tCmd('items.settingsTeamLabel'), description: tCmd('items.settingsTeamDesc'), shortcut: 'sw', icon: <Users className="w-4 h-4" />, group: g('settings'), href: '/settings/studio/team', permission: 'settings.view' },
    { id: 'settings-roles', label: tCmd('items.settingsRolesLabel'), description: tCmd('items.settingsRolesDesc'), shortcut: 'sr', icon: <Shield className="w-4 h-4" />, group: g('settings'), href: '/settings/studio/roles', permission: 'settings.view' },
    { id: 'settings-integrations', label: tSet('integrations'), description: tCmd('items.settingsIntegrationsDesc'), shortcut: 'si', icon: <Zap className="w-4 h-4" />, group: g('settings'), href: '/settings/studio/integrations', permission: 'settings.view' },
    { id: 'help', label: tNav('helpCenter'), description: tCmd('items.helpDesc'), shortcut: 'he', icon: <HelpCircle className="w-4 h-4" />, group: g('help'), href: '/help' },
  ];
}

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
  const tCmd = useTranslations('commandPalette');
  const navCommands = useNavCommands();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const groupOrder = useMemo(
    () => GROUP_ORDER_KEYS.map((k) => tCmd(`groups.${k}`)),
    [tCmd],
  );

  const allowed = useMemo(
    () => navCommands.filter(item => !item.permission || can(item.permission)),
    [navCommands, can],
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
    return groupOrder
      .filter(g => map.has(g))
      .map(g => ({ group: g, items: map.get(g)! }));
  }, [filtered, groupOrder]);

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
          <DialogPrimitive.Title className="sr-only">{tCmd('searchPlaceholder')}</DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tCmd('searchPlaceholder')}
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
                {tCmd('noResults', { query })}
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
              {tCmd('navigate')}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              {tCmd('open')}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">esc</kbd>
              {tCmd('close')}
            </span>
            <span className="ml-auto text-[11px] text-gray-400">
              {tCmd('shortcutHint')}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
