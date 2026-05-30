'use client';

import { usePathname } from 'next/navigation';
import { NavPills } from '@/components/shared/nav-pills';
import { useTranslations } from 'next-intl';

/**
 * CRM nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
export function CrmNav() {
  const pathname = usePathname();
  const t = useTranslations('crmNav');

  const items = [
    { label: t('contacts'), href: '/crm/contacts' },
    { label: t('pipeline'), href: '/crm/pipeline' },
    { label: t('proposals'), href: '/crm/proposals' },
  ];

  return <NavPills id="crm-nav" items={items} activeHref={pathname} />;
}
