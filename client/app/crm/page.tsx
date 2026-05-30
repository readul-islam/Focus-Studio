'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CRMPage() {
  const router = useRouter();
  const t = useTranslations('crmPage');

  useEffect(() => {
    router.replace('/crm/pipeline');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">{t('redirecting')}</p>
      </div>
    </div>
  );
}
