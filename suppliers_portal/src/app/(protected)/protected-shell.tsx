'use client';

import Loader from '@/components/ui/loader';
import { useSupplierUser } from '@/hooks/useSupplierUser';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { supplier, isLoading } = useSupplierUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!supplier) {
      router.replace('/login');
    }
  }, [isLoading, supplier, router]);

  if (isLoading || !supplier) {
    return <Loader />;
  }

  return <>{children}</>;
}
