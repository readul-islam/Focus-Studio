'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function NotionCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'error') {
      window.opener?.postMessage({ type: 'OAUTH_CANCELLED' }, window.location.origin);
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
      <p className="text-sm text-gray-600">Connecting Notion…</p>
    </div>
  );
}

export default function NotionOAuthCallback() {
  return (
    <Suspense>
      <NotionCallbackContent />
    </Suspense>
  );
}
