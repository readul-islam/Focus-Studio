'use client';

import { usePathname } from 'next/navigation';
import { NavPills } from '@/components/shared/nav-pills';

/**
 * CRM nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
export function CrmNav() {
  const pathname = usePathname();

  const items = [
    { label: 'Contacts', href: '/crm/contacts' },
    { label: 'Pipeline', href: '/crm/pipeline' },
    { label: 'Proposals', href: '/crm/proposals' },
  ];

  return <NavPills id="crm-nav" items={items} activeHref={pathname} />;
}
