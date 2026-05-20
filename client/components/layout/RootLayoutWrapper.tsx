'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SubscriptionGate } from '@/components/billing/subscription-gate';
import PrivateRoute from '@/layout/PrivateRoute';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/verify-otp',
  '/reset-password',
  '/forgot-password',
  '/accept-invitation',
  '/pricing',
  '/auth/google/callback',
];
const STANDALONE_ROUTES = [
  '/xeroredirect',
  '/oauth/gmail/callback',
  '/oauth/notion/callback',
  '/onboarding',
  '/billing/success',
  '/billing/cancel',
];

export function RootLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic =
    !!pathname &&
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isPdfRoute = pathname?.includes('/pdf/');
  const isStandalone = STANDALONE_ROUTES.includes(pathname);
  const isContractorPortal = pathname?.startsWith('/contractor/');
  const isSignPage = pathname?.startsWith('/sign/');
  const isPrototype = pathname?.startsWith('/prototype/');

  
  // if(!user?.studio && !isLoading){
  //   router.replace('/onboarding');
  //   return ;
  // }
  
  // Signing page, contractor portal, PDF routes — completely standalone, no nav, no auth
  if (isPublic || isPdfRoute || isContractorPortal || isSignPage) {
    return <>{children}</>;
  }

  // Standalone routes with auth but no sidebar/topbar (prototypes, OAuth callbacks, etc.)
  if (isStandalone || isPrototype) {
    return <PrivateRoute>{children}</PrivateRoute>;
  }

  return (
    <PrivateRoute>
      <SubscriptionGate>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex-1 h-screen flex flex-col min-w-0 bg-background">
              <TopBar />
              <main className="flex-1 bg-muted/30 overflow-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </SubscriptionGate>
    </PrivateRoute>
  );
}