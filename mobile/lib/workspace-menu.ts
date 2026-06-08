import type { Href } from 'expo-router';
import type { Ionicons } from '@expo/vector-icons';
import { routes } from '@/lib/routes';

export type WorkspaceMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
  matchPaths: string[];
};

/** Main navigation — mirrors web personal sidebar */
export const mainNavItems: WorkspaceMenuItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: 'home-outline',
    href: '/(tabs)' as Href,
    matchPaths: ['/', '/(tabs)', '/(tabs)/index'],
  },
  {
    key: 'tasks',
    label: 'My tasks',
    icon: 'checkbox-outline',
    href: '/(tabs)/tasks' as Href,
    matchPaths: ['/(tabs)/tasks', '/task'],
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: 'folder-outline',
    href: '/(tabs)/projects' as Href,
    matchPaths: ['/(tabs)/projects', '/project'],
  },
  {
    key: 'inbox',
    label: 'Inbox',
    icon: 'mail-outline',
    href: routes.inbox,
    matchPaths: ['/inbox'],
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    href: routes.calendar,
    matchPaths: ['/calendar'],
  },
];

/** Studio workspace tools — mirrors web studio sidebar group */
export const studioNavItems: WorkspaceMenuItem[] = [
  {
    key: 'search',
    label: 'Search',
    icon: 'search-outline',
    href: routes.search,
    matchPaths: ['/search'],
  },
  {
    key: 'crm',
    label: 'CRM',
    icon: 'people-outline',
    href: routes.contacts,
    matchPaths: ['/contacts'],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: 'wallet-outline',
    href: routes.finance,
    matchPaths: ['/finance'],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'bar-chart-outline',
    href: routes.reports,
    matchPaths: ['/reports'],
  },
  {
    key: 'time',
    label: 'Time tracking',
    icon: 'time-outline',
    href: routes.time,
    matchPaths: ['/time'],
  },
];

const PLAN_NAMES: Record<string, string> = {
  beta: 'Beta Access',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export function planDisplayName(planTier?: string | null): string {
  if (!planTier) return 'Select a plan';
  return PLAN_NAMES[planTier] ?? planTier.charAt(0).toUpperCase() + planTier.slice(1);
}

export function isNavItemActive(pathname: string, item: WorkspaceMenuItem): boolean {
  return item.matchPaths.some(path => {
    if (path === '/' || path === '/(tabs)' || path === '/(tabs)/index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}
