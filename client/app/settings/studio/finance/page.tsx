'use client';

import { Section } from '@/components/settings/section';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useUser from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { StripePaymentsSetup } from '@/components/finance/stripe-payments-setup';
import { useTranslations } from 'next-intl';

interface StudioFinanceData {
  default_currency?: string;
  default_tax_rate?: number;
}

function StudioFinancePageContent() {
  const t = useTranslations('settingsFinancePage');
  const { user, isLoading } = useUser();
  const [studioData, setStudioData] = useState<StudioFinanceData | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    if (user?.studio) {
      setStudioData({
        default_currency: user.studio.default_currency,
        default_tax_rate: user.studio.default_tax_rate,
      });
    }
  }, [user?.email, isLoading]);

  const mutation = useMutation({
    mutationFn: async (data: StudioFinanceData) => {
      return await patchData({
        url: '/user/studios/update/',
        data: {
          default_currency: data?.default_currency?.code,
          default_tax_rate: data?.default_tax_rate,
        },
      });
    },
    onSuccess: () => {
      localStorage.setItem('studioCurrency', JSON.stringify(studioData?.default_currency));
      queryClient.invalidateQueries({ queryKey: ['users', user?.email] });
      toast.success(t('toasts.updated'));
    },
    onError: () => {
      toast.error(t('toasts.updateFailed'));
    },
  });

  const handleUpdate = e => {
    const { name, value } = e.target;
    setStudioData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateCurrency = e => {
    setStudioData(prev => ({
      ...prev,
      default_currency: e.currency,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studioData) {
      mutation.mutate(studioData);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('description')}</p>
      </div>

      <Section title={t('defaultsTitle')} description={t('defaultsDescription')}>
        <form onSubmit={e => handleSubmit(e)} className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default_currency">{t('defaultCurrency')}</Label>
            <CurrencySelector value={studioData?.default_currency} onChange={handleUpdateCurrency} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_tax_rate">{t('defaultTaxRate')}</Label>
            <Input
              value={studioData?.default_tax_rate}
              onChange={value => {
                const e = {
                  target: {
                    name: 'default_tax_rate',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="default_tax_rate"
              name="default_tax_rate"
              type="number"
              step="0.01"
              defaultValue={8.875}
              placeholder="0.00"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button>{t('saveFinanceSettings')}</Button>
          </div>
        </form>
      </Section>

      <Section title={t('paymentsTitle')} description={t('paymentsDescription')}>
        <StripePaymentsSetup variant="banner" />
      </Section>
    </div>
  );
}

export default function StudioFinancePage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <StudioFinancePageContent />
    </PermissionGuard>
  );
}
