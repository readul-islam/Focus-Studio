'use client';

import Link from 'next/link';
import { ChevronRight, BarChart3 } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ReportBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function ReportBreadcrumb({ items }: ReportBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6">
      <Link 
        href="/reports" 
        className="flex items-center gap-1 hover:text-ink transition-colors"
      >
        <BarChart3 className="w-4 h-4" />
        <span>Reports</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-ink transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}