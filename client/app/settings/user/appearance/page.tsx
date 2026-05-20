'use client';

import { useCallback, useEffect, useState } from 'react';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import { gooeyToast as toast } from 'goey-toast';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { Monitor, Moon, Sun, RotateCcw, Compass } from 'lucide-react';
import { useProductTour } from '@/hooks/useProductTour';
import { MAIN_APP_TOUR_ID } from '@/lib/product-tour';
import {
  applyAppearanceToDocument,
  DEFAULT_APPEARANCE,
  type AppearanceDensity,
  type AppearancePrefs,
  type AppearanceTheme,
} from '@/lib/appearance';

const APPEARANCE_URL = '/user/self/appearance/';

const THEME_OPTIONS: { value: AppearanceTheme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const DENSITY_OPTIONS: { value: AppearanceDensity; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'More content on screen' },
  { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
  { value: 'spacious', label: 'Spacious', description: 'Extra breathing room' },
];

const ACCENT_PRESETS = ['#111827', '#1e3a2f', '#7c2d12', '#1e40af', '#6b21a8'];

export default function UserAppearancePage() {
  const { restartTour } = useProductTour(MAIN_APP_TOUR_ID);
  const queryClient = useQueryClient();
  const { theme: activeTheme, setTheme } = useTheme();
  const { data, isLoading } = useFetch(APPEARANCE_URL);
  const { mutate: saveAppearance, isPending } = usePatch({
    onSuccess: () => {
      toast.success('Appearance saved.');
      queryClient.invalidateQueries({ queryKey: [APPEARANCE_URL] });
    },
    onError: () => toast.error('Failed to save appearance.'),
  });

  const [prefs, setPrefs] = useState<AppearancePrefs>(DEFAULT_APPEARANCE);
  const [dirty, setDirty] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (data) {
      setPrefs(data as AppearancePrefs);
      setDirty(false);
    }
  }, [data]);

  const applyPrefs = useCallback(
    (next: AppearancePrefs) => {
      setTheme(next.theme);
      applyAppearanceToDocument(next);
    },
    [setTheme]
  );

  const updateTheme = (value: AppearanceTheme) => {
    const next = { ...prefs, theme: value };
    setPrefs(next);
    applyPrefs(next);
    saveAppearance({ url: APPEARANCE_URL, data: { theme: value } });
  };

  const update = <K extends keyof AppearancePrefs>(key: K, val: AppearancePrefs[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: val };
      applyPrefs(next);
      return next;
    });
    setDirty(true);
  };

  const handleSave = () => {
    saveAppearance({ url: APPEARANCE_URL, data: prefs });
    setDirty(false);
  };

  const handleReset = () => {
    setPrefs(DEFAULT_APPEARANCE);
    applyPrefs(DEFAULT_APPEARANCE);
    saveAppearance({ url: APPEARANCE_URL, data: DEFAULT_APPEARANCE });
    setDirty(false);
  };

  const selectedTheme = mounted ? (activeTheme as AppearanceTheme) ?? prefs.theme : prefs.theme;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-foreground">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Theme applies instantly (top bar sun/moon icon too). Save density and accent to sync across devices.
        </p>
      </div>

      <Section title="Theme" description="Light, dark, or follow your system.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              disabled={isLoading || !mounted}
              onClick={() => updateTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                selectedTheme === value
                  ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent/50'
              )}
            >
              <Icon className="size-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Density" description="Adjust spacing and base font size across the app.">
        <div className="flex flex-col sm:flex-row gap-2">
          {DENSITY_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              disabled={isLoading}
              onClick={() => update('density', value)}
              className={cn(
                'flex-1 rounded-xl border px-4 py-3 text-left transition-colors',
                prefs.density === value
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50'
              )}
            >
              <div className="font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent color" description="Highlights buttons, links, and focus rings.">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(color => (
              <button
                key={color}
                type="button"
                disabled={isLoading}
                aria-label={`Accent ${color}`}
                onClick={() => update('accent_color', color)}
                className={cn(
                  'size-9 rounded-full border-2 transition-transform hover:scale-105',
                  prefs.accent_color === color ? 'border-foreground scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
            <label
              className={cn(
                'relative flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border',
                !prefs.accent_color && 'border-primary'
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground">Custom</span>
              <Input
                type="color"
                disabled={isLoading}
                value={prefs.accent_color ?? '#111827'}
                onChange={e => update('accent_color', e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </label>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 density-aware">
            <p className="text-sm text-muted-foreground mb-3">Preview</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Primary button</Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <span className="text-sm text-primary font-medium">Accent link</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => update('accent_color', null)}
            className="text-muted-foreground"
          >
            <RotateCcw className="size-4 mr-1.5" />
            Reset accent to default
          </Button>
        </div>
      </Section>

      <Section
        title="Product tour"
        description="Replay the guided walkthrough of navigation, search, and your dashboard."
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            restartTour();
            toast.success('Tour started — go to Home dashboard if steps do not appear.');
          }}
        >
          <Compass className="size-4 mr-2" />
          Restart guided tour
        </Button>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" disabled={isLoading || isPending} onClick={handleReset}>
          Reset all
        </Button>
        <Button type="button" onClick={handleSave} disabled={isPending || isLoading || !dirty}>
          {isPending ? 'Saving...' : 'Save density & accent'}
        </Button>
      </div>
    </div>
  );
}
