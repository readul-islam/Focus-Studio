'use client';

import { useEffect, useState } from 'react';
import type { SupplierAccount } from '@/types/supplier';

export function useSupplierUser() {
  const [supplier, setSupplier] = useState<SupplierAccount | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('supplier');
    setSupplier(raw ? JSON.parse(raw) : null);
    setHydrated(true);
  }, []);

  return {
    supplier: hydrated ? supplier : null,
    isLoading: !hydrated,
  };
}
