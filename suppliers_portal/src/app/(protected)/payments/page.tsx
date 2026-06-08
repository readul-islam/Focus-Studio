'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { useSupplierUser } from '@/hooks/useSupplierUser';
import { postData } from '@/lib/api';

type StripeConnectStatus = {
  configured: boolean;
  connected: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requires_action?: boolean;
  email?: string | null;
  company_name?: string | null;
};

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supplier } = useSupplierUser();
  const [email, setEmail] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: status, isLoading, refetch } = useFetch<StripeConnectStatus>(
    'supplier_portal/stripe-connect/status/',
  );

  useEffect(() => {
    if (supplier?.email && !email) {
      setEmail(supplier.email);
    }
  }, [supplier?.email, email]);

  useEffect(() => {
    if (searchParams.get('return') === '1' || searchParams.get('refresh') === '1') {
      setSyncing(true);
      postData<StripeConnectStatus>('supplier_portal/stripe-connect/sync/', {})
        .then(() => refetch())
        .finally(() => {
          setSyncing(false);
          router.replace('/payments');
        });
    }
  }, [searchParams, refetch, router]);

  const startOnboarding = async () => {
    setError(null);
    setStarting(true);
    try {
      const response = await postData<{ url: string }>('supplier_portal/stripe-connect/onboard/', {
        email: email.trim(),
      });
      window.location.href = response.url;
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(detail || 'Could not start Stripe onboarding.');
      setStarting(false);
    }
  };

  if (isLoading || !status) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  const ready = status.charges_enabled && status.payouts_enabled;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link href="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Connect Stripe to receive payments when studios pay for catalog orders.
          </p>
        </div>

        {!status.configured ? (
          <Card>
            <CardContent className="py-8 text-sm text-neutral-600">
              Stripe is not configured on this platform yet. Contact support to enable supplier payouts.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5" />
                Stripe Connect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {ready ? (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Payouts are enabled</p>
                    <p className="mt-1 text-emerald-800">
                      Studios can pay you directly for catalog procurement items.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-600">
                  Complete Stripe onboarding to accept card payments from studios. Funds are transferred to your
                  connected account after each successful checkout.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="stripe-email">Payout email</Label>
                <Input
                  id="stripe-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  disabled={starting || syncing}
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button onClick={startOnboarding} disabled={starting || syncing || !email.trim()}>
                  {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {status.connected ? 'Continue Stripe setup' : 'Connect with Stripe'}
                </Button>
                {status.connected ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSyncing(true);
                      postData<StripeConnectStatus>('supplier_portal/stripe-connect/sync/', {})
                        .then(() => refetch())
                        .finally(() => setSyncing(false));
                    }}
                    disabled={syncing || starting}
                  >
                    {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Refresh status
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
