'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/useFetch';

export function BreadcrumbBar() {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = React.useState(pathname);
  React.useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);
  const segments = currentPath.split('/').filter(Boolean);
  
  const users = []

  // Project ID only if first segment is "projects"
  const projectID = segments[0] === 'projects' ? segments[1] : null;

  // Fetch project data using new API
  const { data: projectData } = useFetch(
    projectID ? `projects/projects/${projectID}/` : null
  );

  // Extract IDs for PO and Invoice from segments
  const poIndex = segments.indexOf('purchase-order');
  const poId = poIndex !== -1 && segments[poIndex + 1] ? segments[poIndex + 1] : null;

  const invIndex = segments.indexOf('invoices');
  const invId = invIndex !== -1 && segments[invIndex + 1] ? segments[invIndex + 1] : null;

  // Fetch PO and Invoice data
  const { data: poData } = useFetch(poId ? `finance/purchase-orders/${poId}/` : null, { enabled: !!poId });
  const { data: invData } = useFetch(invId ? `finance/invoices/${invId}/` : null, { enabled: !!invId });

  // Extract phase ID from /reports/phase/[id]
  const phaseIndex = segments.indexOf('phase');
  const phaseId = phaseIndex !== -1 && segments[phaseIndex + 1] ? segments[phaseIndex + 1] : null;

  // Fetch phase data
  const { data: phaseData } = useFetch(phaseId ? `projects/phases/${phaseId}/` : null, { enabled: !!phaseId });

  const getBreadcrumbs = () => {
    if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

    const breadcrumbs: { label: string; href: string }[] = [];
    const decodeSeg = (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch (e) {
        return s;
      }
    };
    const firstSegment = segments[0];

    // --- First segment handling ---
    switch (firstSegment) {
      case 'home':
        breadcrumbs.push({ label: 'Home', href: '/home/dashboard' });
        break;
      case 'crm':
        breadcrumbs.push({ label: 'CRM', href: '/crm/contacts' });
        break;
      case 'projects':
        breadcrumbs.push({ label: 'Projects', href: '/projects' });
        if (segments[1]) {
          breadcrumbs.push({
            label: projectData?.project_name || 'Loading...',
            href: `/projects/${segments[1]}`,
          });
        }
        break;
      case 'library':
        breadcrumbs.push({ label: 'Library', href: '/library' });
        break;
      case 'calendar':
        breadcrumbs.push({ label: 'Calendar', href: '/calendar' });
        break;
      case 'finance':
        breadcrumbs.push({ label: 'Finance', href: '/finance' });
        break;
      case 'reports':
        breadcrumbs.push({ label: 'Reports', href: '/reports' });
        break;
      case 'settings':
        breadcrumbs.push({ label: 'Settings', href: '/settings' });
        break;
      default:
        breadcrumbs.push({ label: decodeSeg(firstSegment), href: `/${firstSegment}` });
    }

    // --- Remaining segments ---
    const startIndex = firstSegment === 'projects' ? 2 : 1;

    for (let i = startIndex; i < segments.length; i++) {
      const rawSeg = segments[i];
      const seg = decodeSeg(rawSeg);
      let label = seg;

      // Special case: /reports/productivity/:userID
      if (firstSegment === 'reports' && segments[1] === 'productivity' && i === 2) {
        const user = users?.data?.find(u => u.id === rawSeg);
        label = user ? user.name : 'Loading..';
      }

      // Dynamic label for PO ID
      if (poId && rawSeg === poId) {
        label = poData?.display_po || 'Loading...';
      }

      // Dynamic label for Invoice ID
      if (invId && rawSeg === invId) {
        label = invData?.display_invoice || 'Loading...';
      }

      // Special case: finance/purchase-order links to /finance
      if (segments[i] === 'purchase-order') {
        const baseUrl = segments[0] === 'projects' ? `/projects/${segments[1]}/finance` : '/finance';
        breadcrumbs.push({
          label: 'Purchase Order',
          href: baseUrl,
        });
        continue;
      }

      // Special case: finance/invoices links to /finance (or project finance when project-scoped)
      if (segments[i] === 'invoices') {
        const baseUrl = segments[0] === 'projects' ? `/projects/${segments[1]}/finance` : '/finance';
        breadcrumbs.push({
          label: 'Invoices',
          href: baseUrl,
        });
        continue;
      }

      // Special case: /reports/phase - clicking should go to /reports
      if (segments[0] === 'reports' && rawSeg === 'phase') {
        breadcrumbs.push({
          label: 'Phase',
          href: '/reports/projects',
        });
        continue;
      }

      // Special case: /reports/phase/[id] - show phase name
      if (segments[1] === 'phase' && phaseId && rawSeg === phaseId) {
        label = (phaseData as any)?.name || 'Loading...';
      }

      // Special case: /reports/team/[id] - stop at "Team", don't show user ID
      if (segments[1] === 'team' && i === 2) {
        // Don't add the user ID to breadcrumbs, just stop
        break;
      }

      // If the segment is 'folders', stop adding more breadcrumbs
      if (rawSeg === 'folders') {
        break;
      }

      const href = '/' + segments.slice(0, i + 1).join('/');

      breadcrumbs.push({
        label,
        href,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav key={currentPath} className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Link
            href={crumb.href}
            className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium capitalize' : 'text-gray-600 capitalize'}
          >
            {crumb.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
