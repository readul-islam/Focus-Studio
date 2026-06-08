'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/loader';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const supplier = localStorage.getItem('supplier');
    router.replace(supplier ? '/dashboard' : '/login');
  }, [router]);

  return <Loader />;
}
