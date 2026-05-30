'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function BillingCancelPage() {
  const t = useTranslations('billingCancelPage');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="relative max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('description')}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="rounded-lg w-full">
            <Link href="/settings/studio/billing">{t('viewPlans')}</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-lg w-full">
            <Link href="/home/dashboard">{t('backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
