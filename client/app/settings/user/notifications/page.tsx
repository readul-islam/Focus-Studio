'use client';

import { Section } from '@/components/settings/section';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import { gooeyToast as toast } from 'goey-toast';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';

const PREFS_URL = '/user/self/notification-preferences/';

const PREF_KEYS = ['project_updates', 'comments', 'reminders', 'marketing_emails'] as const;

type PrefsKey = (typeof PREF_KEYS)[number];
type Prefs = Record<PrefsKey, boolean>;

export default function UserNotificationsPage() {
  const t = useTranslations('settingsNotificationsPage');
  const tc = useTranslations('common');
  const { data, isLoading } = useFetch(PREFS_URL);
  const { mutate: savePrefs, isPending } = usePatch({
    onSuccess: () => toast.success(t('toasts.updated')),
    onError: () => toast.error(t('toasts.saveFailed')),
  });

  const items = useMemo(
    () =>
      PREF_KEYS.map((key) => ({
        key,
        name: t(`items.${key}.name`),
        desc: t(`items.${key}.description`),
      })),
    [t],
  );

  const [prefs, setPrefs] = useState<Prefs>({
    project_updates: true,
    comments: true,
    reminders: true,
    marketing_emails: true,
  });

  useEffect(() => {
    if (data) setPrefs(data as Prefs);
  }, [data]);

  const handleSave = () => {
    savePrefs({ url: PREFS_URL, data: prefs });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('description')}</p>
      </div>

      <Section title={t('preferencesTitle')} description={t('preferencesDescription')}>
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.key} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <div className="font-medium text-gray-900">{i.name}</div>
                <div className="text-sm text-gray-600">{i.desc}</div>
              </div>
              <Switch
                checked={prefs[i.key]}
                disabled={isLoading}
                onCheckedChange={val => setPrefs(prev => ({ ...prev, [i.key]: val }))}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending || isLoading}>
              {isPending ? tc('saving') : t('savePreferences')}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
