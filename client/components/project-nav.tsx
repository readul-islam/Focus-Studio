'use client';

import { usePathname } from 'next/navigation';
import { NavPills } from '@/components/shared/nav-pills';
import { usePermissions } from '@/hooks/usePermissions';

const navItems = [
  { label: 'Overview',     href: '',             permission: null },
  { label: 'Tasks',        href: '/tasks',       permission: 'tasks.view' },
  { label: 'Email',        href: '/messages',    permission: null },
  { label: 'Team',         href: '/team',        permission: null },
  { label: 'Procurement',  href: '/procurement', permission: 'procurement.view' },
  { label: 'Finance',      href: '/finance',     permission: 'finance.view' },
  { label: 'Files',        href: '/docs',        permission: 'documents.view' },
  { label: 'Contractors',  href: '/contractors', permission: null },
  { label: 'Settings',     href: '/settings',    permission: null },
];

interface ProjectNavProps {
  projectId: string;
}

export function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();
  const { can } = usePermissions();

  const items = navItems
    .filter(i => !i.permission || can(i.permission))
    .map(i => ({
      label: i.label,
      href: `/projects/${projectId}${i.href}`,
    }));

  return <NavPills id={`project-nav-${projectId}`} items={items} activeHref={pathname} />;
}
