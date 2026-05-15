'use client';

import { useEffect, useState } from 'react';
import { Section } from '@/components/settings/section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import { gooeyToast as toast } from 'goey-toast';

const APPEARANCE_URL = '/user/self/appearance/';

type Appearance = {
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact' | 'spacious';
  accent_color: string | null;
};

const DEFAULTS: Appearance = { theme: 'system', density: 'comfortable', accent_color: null };

export default function UserAppearancePage() {
  const { data, isLoading } = useFetch(APPEARANCE_URL);
  const { mutate: saveAppearance, isPending } = usePatch({
    onSuccess: () => toast.success('Appearance updated.'),
    onError: () => toast.error('Failed to save appearance.'),
  });

  const [prefs, setPrefs] = useState<Appearance>(DEFAULTS);

  useEffect(() => {
    if (data) setPrefs(data as Appearance);
  }, [data]);

  const set = <K extends keyof Appearance>(key: K, val: Appearance[K]) =>
    setPrefs(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveAppearance({ url: APPEARANCE_URL, data: prefs });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-600">Theme, density, and accent color.</p>
      </div>

      <Section title="Interface" description="Personalize how the app looks for you.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={prefs.theme}
              disabled={isLoading}
              onValueChange={val => set('theme', val as Appearance['theme'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Density</Label>
            <Select
              value={prefs.density}
              disabled={isLoading}
              onValueChange={val => set('density', val as Appearance['density'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent">Accent color</Label>
            <Input
              id="accent"
              type="color"
              disabled={isLoading}
              value={prefs.accent_color ?? '#111827'}
              onChange={e => set('accent_color', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={handleSave} disabled={isPending || isLoading}>
              {isPending ? 'Saving...' : 'Save appearance'}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
