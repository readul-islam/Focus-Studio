'use client';

import { ExportPDF } from '@/components/reports/ExportPDF';
import { ReportInsights } from '@/components/reports/ReportInsights';

interface ReportPageHeaderProps {
  title: string;
  subtitle: string;
  printTitle?: string;
}

export function ReportPageHeader({ title, subtitle, printTitle }: ReportPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-between no-print">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <ExportPDF title={printTitle ?? title} />
        <ReportInsights />
      </div>
    </div>
  );
}
