'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { fetchData } from '@/lib/Api';
import { googleAuthErrorMessage } from '@/lib/google-auth';
import type { AppUser } from '@/hooks/useUser';

const MAX_ATTEMPTS = 15;
const RETRY_MS = 500;

async function waitForSession(): Promise<AppUser | null> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, RETRY_MS));
    }
    try {
      const user = (await fetchData('user/self/')) as AppUser;
      if (user?.email) return user;
    } catch {
      /* cookies may not be visible to the API yet — retry */
    }
  }
  return null;
}

function decodeNextParam(encoded: string | null): string {
  if (!encoded) return '/home/dashboard';
  try {
    const pad = '='.repeat((4 - (encoded.length % 4)) % 4);
    const raw = atob(encoded.replace(/-/g, '+').replace(/_/g, '/') + pad);
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  } catch {
    /* ignore */
  }
  return '/home/dashboard';
}

function GoogleAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await waitForSession();
      if (cancelled) return;

      if (!user) {
        router.replace('/login?error=google_session');
        return;
      }

      const isNew = searchParams.get('is_new') === '1';
      const nextEncoded = searchParams.get('next');

      if (isNew || !user.studio) {
        router.replace('/onboarding');
        return;
      }

      router.replace(decodeNextParam(nextEncoded));
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const Wrapper = 'div' as const;

  return (
    <Wrapper className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <Wrapper className="flex items-center gap-2 mb-8">
        <Image src="/brand/Logo.png" alt="Focuspilot" width={32} height={32} className="object-contain" />
        <span className="text-lg font-semibold text-gray-900">Focuspilot</span>
      </Wrapper>
      <p className="text-sm text-center max-w-sm text-gray-600">{message}</p>
      <Wrapper className="mt-6 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
    </Wrapper>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
          Completing sign-in…
        </div>
      }
    >
      <GoogleAuthCallbackContent />
    </Suspense>
  );
}
