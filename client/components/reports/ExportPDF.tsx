'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportPDFProps {
  title: string;
  className?: string;
}

export function ExportPDF({ title, className }: ExportPDFProps) {
  const handlePrint = () => {
    // Use browser's print dialog which can save as PDF
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      size="sm"
      className={`border-borderSoft ${className}`}
    >
      <Download className="w-4 h-4 mr-2" />
      Export PDF
    </Button>
  );
}

// CSS for print media - add this to globals.css or include in layout
export const printStyles = `
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-full-width {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  body {
    font-size: 12px !important;
  }
  
  h1 {
    font-size: 18px !important;
  }
  
  h2 {
    font-size: 16px !important;
  }
  
  h3 {
    font-size: 14px !important;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .avoid-break {
    page-break-inside: avoid;
  }
}
`;