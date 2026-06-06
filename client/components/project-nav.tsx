'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NavPills } from '@/components/shared/nav-pills';
import { usePermissions } from '@/hooks/usePermissions';

const navItemKeys = [
  { labelKey: 'overview', href: '', permission: null },
  { labelKey: 'tasks', href: '/tasks', permission: 'tasks.view' },
  { labelKey: 'email', href: '/messages', permission: null },
  { labelKey: 'team', href: '/team', permission: null },
  { labelKey: 'procurement', href: '/procurement', permission: 'procurement.view' },
  { labelKey: 'finance', href: '/finance', permission: 'finance.view' },
  { labelKey: 'files', href: '/docs', permission: 'documents.view' },
  { labelKey: 'presentations', href: '/presentations', permission: 'presentations.view' },
  { labelKey: 'contractors', href: '/contractors', permission: null },
  { labelKey: 'settings', href: '/settings', permission: null },
] as const;

interface ProjectNavProps {
  projectId: string;
}

export function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const t = useTranslations('projectNav');

  const items = navItemKeys
    .filter((i) => !i.permission || can(i.permission))
    .map((i) => ({
      label: t(i.labelKey),
      href: `/projects/${projectId}${i.href}`,
    }));

  return <NavPills id={`project-nav-${projectId}`} items={items} activeHref={pathname} />;
}
