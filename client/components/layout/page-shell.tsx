import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Shared page chrome: fills viewport below top bar; bg comes from `main` in RootLayoutWrapper. */
export const pageShellClassName =
  'flex-1 min-h-[calc(100vh-var(--topbar-height,3.5rem))] w-full p-4 sm:p-6';

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(pageShellClassName, className)}>{children}</div>;
}
