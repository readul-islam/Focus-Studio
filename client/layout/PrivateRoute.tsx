'use client';

import useUser from '@/hooks/useUser';
import { isPublicAppRoute } from '@/lib/auth-routes';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = isPublicAppRoute(pathname);
  const { user, isLoading } = useUser({ enabled: !isPublic });
  const isOnboarding = pathname === '/onboarding';

  useEffect(() => {
    if (isLoading) return;

    // No session → login
    if (!user?.email && !isPublic) {
      router.push('/login');
      return;
    }

    // Authenticated, no studio → force onboarding (unless already there)
    if (user?.email && !user?.studio && !isOnboarding) {
      router.push('/onboarding');
      return;
    }

    // Authenticated, has studio → bounce away from onboarding
    if (user?.email && user?.studio && isOnboarding) {
      router.push('/home/dashboard');
    }
  }, [isLoading, user, isPublic, isOnboarding, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user?.email && !isPublic) return null;

  // Block render until redirect fires — no flash of protected content
  if (user?.email && !user?.studio && !isOnboarding) return null;

  return <>{children}</>;
}
