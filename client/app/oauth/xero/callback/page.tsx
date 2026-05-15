'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function XeroCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    // postMessage for same-origin flows; parent also polls URL as fallback
    if (status === 'error') {
      window.opener?.postMessage({ type: 'OAUTH_CANCELLED' }, window.location.origin);
    }
    if (status === 'success') {
      window.opener?.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
    }
    // Small delay so parent's poll interval can read the URL before close
    setTimeout(() => window.close(), 800);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Connecting Xero…</p>
    </div>
  );
}

export default function XeroOAuthCallback() {
  return (
    <Suspense>
      <XeroCallbackContent />
    </Suspense>
  );
}
