'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/settings/studio/general'); }, [router]);
  return null;
}
