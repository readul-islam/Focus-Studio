'use client';

import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const router = useRouter();
  const { verifySession, invalidate } = useBilling();
  const [error, setError] = useState<string | null>(null);
  const verified = useRef(false);

  useEffect(() => {
    if (!sessionId || verified.current) return;
    verified.current = true;

    verifySession
      .mutateAsync(sessionId)
      .then(() => {
        invalidate();
        setTimeout(() => router.replace('/home/dashboard'), 2000);
      })
      .catch(() => {
        setError('We could not confirm your subscription yet. It may still be processing.');
      });
  }, [sessionId, verifySession, invalidate, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="relative max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <Button asChild className="mt-6 w-full rounded-lg">
              <Link href="/settings/studio/billing">Go to billing settings</Link>
            </Button>
          </>
        ) : verifySession.isPending || (!error && sessionId) ? (
          <>
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Subscription confirmed</h1>
            <p className="mt-2 text-sm text-gray-600">
              {verifySession.isPending
                ? 'Activating your plan…'
                : 'Redirecting to your dashboard…'}
            </p>
            <Loader2 className="mx-auto mt-4 size-6 animate-spin text-gray-400" />
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Missing checkout session.</p>
            <Button asChild className="mt-6 w-full rounded-lg">
              <Link href="/settings/studio/billing">Choose a plan</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
