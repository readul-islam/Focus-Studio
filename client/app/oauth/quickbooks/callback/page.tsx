'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function QuickBooksCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'error' || status === 'not_configured') {
      window.opener?.postMessage({ type: 'OAUTH_CANCELLED' }, window.location.origin);
    }
    if (status === 'success') {
      window.opener?.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
    }
    setTimeout(() => window.close(), 800);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Connecting QuickBooks…</p>
    </div>
  );
}

export default function QuickBooksOAuthCallback() {
  return (
    <Suspense>
      <QuickBooksCallbackContent />
    </Suspense>
  );
}
