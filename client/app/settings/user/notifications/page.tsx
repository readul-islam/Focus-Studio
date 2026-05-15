'use client';

import { Section } from '@/components/settings/section';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import { gooeyToast as toast } from 'goey-toast';
import { useState, useEffect } from 'react';

const PREFS_URL = '/user/self/notification-preferences/';

const items = [
  { name: 'Project updates', key: 'project_updates', desc: 'Mentions, status changes, and assignments.' },
  { name: 'Comments', key: 'comments', desc: "Replies to threads you're in." },
  { name: 'Reminders', key: 'reminders', desc: 'Deadlines and overdue tasks.' },
  { name: 'Marketing emails', key: 'marketing_emails', desc: 'Product news and tips.' },
] as const;

type PrefsKey = (typeof items)[number]['key'];
type Prefs = Record<PrefsKey, boolean>;

export default function UserNotificationsPage() {
  const { data, isLoading } = useFetch(PREFS_URL);
  const { mutate: savePrefs, isPending } = usePatch({
    onSuccess: () => toast.success('Notification preferences updated.'),
    onError: () => toast.error('Failed to save preferences.'),
  });

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
        <h1 className="text-base font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600">Choose what you want to be notified about.</p>
      </div>

      <Section title="Preferences" description="Control email and push notifications.">
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
              {isPending ? 'Saving...' : 'Save preferences'}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
