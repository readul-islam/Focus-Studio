'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wraps a page and redirects if the current user lacks the given permission.
 * Shows nothing while permissions are loading to avoid flashing content.
 */
export function PermissionGuard({ permission, children, redirectTo = '/' }: PermissionGuardProps) {
  const router = useRouter();
  const { can, isLoading } = usePermissions();

  useEffect(() => {
    if (!isLoading && !can(permission)) {
      router.replace(redirectTo);
    }
  }, [isLoading, can, permission, router, redirectTo]);

  if (isLoading) return null;
  if (!can(permission)) return null;

  return <>{children}</>;
}
