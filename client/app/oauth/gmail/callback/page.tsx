'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GmailCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');

    if (status === 'error') {
      const reason = searchParams.get('reason');
      window.opener?.postMessage(
        { type: 'OAUTH_CANCELLED', reason: reason ?? 'unknown' },
        window.location.origin
      );
      window.close();
      return;
    }

    if (status === 'success') {
      window.opener?.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Connecting Gmail…</p>
    </div>
  );
}

export default function GmailOAuthCallback() {
  return (
    <Suspense>
      <GmailCallbackContent />
    </Suspense>
  );
}
