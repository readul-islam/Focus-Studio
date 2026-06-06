'use client';

import { cn } from '@/lib/utils';
import { fd } from '@/lib/finance-document-styles';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function FinanceDocumentShell({ children, className }: Props) {
  return (
    <div className={fd.page}>
      <div className={cn(fd.shell, className)}>{children}</div>
    </div>
  );
}
