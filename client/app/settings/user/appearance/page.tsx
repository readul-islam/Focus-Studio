'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/settings/section';
import { cn } from '@/lib/utils';
import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import { gooeyToast as toast } from 'goey-toast';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import {
  applyAppearanceToDocument,
  DEFAULT_APPEARANCE,
  type AppearanceDensity,
  type AppearancePrefs,
  type AppearanceTheme,
} from '@/lib/appearance';
import { useTranslations } from 'next-intl';

const APPEARANCE_URL = '/user/self/appearance/';

export default function UserAppearancePage() {
  const t = useTranslations('settingsAppearancePage');
  const queryClient = useQueryClient();
  const { theme: activeTheme, setTheme } = useTheme();
  const { data, isLoading } = useFetch(APPEARANCE_URL);
  const { mutate: saveAppearance } = usePatch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPEARANCE_URL] });
    },
    onError: () => toast.error(t('syncFailed')),
  });

  const interfaceOptions = useMemo(
    () =>
      [
        { value: 'system' as const, label: t('systemPreference'), description: t('systemPreferenceDesc') },
        { value: 'light' as const, label: t('light'), description: t('lightDesc') },
        { value: 'dark' as const, label: t('dark'), description: t('darkDesc') },
      ] as const,
    [t],
  );

  const colorThemeOptions = useMemo(
    () =>
      [
        {
          value: 'forest' as const,
          label: t('defaultGreen'),
          description: t('defaultGreenDesc'),
          colors: ['#10b981', '#040906', '#121e15'],
        },
        {
          value: 'cobalt' as const,
          label: t('blue'),
          description: t('blueDesc'),
          colors: ['#2563eb', '#050a14', '#0f182c'],
        },
        {
          value: 'terracotta' as const,
          label: t('vibrantOrange'),
          description: t('vibrantOrangeDesc'),
          colors: ['#e07a57', '#120c09', '#1f1612'],
        },
        {
          value: 'quartz' as const,
          label: t('royalPurple'),
          description: t('royalPurpleDesc'),
          colors: ['#db2777', '#0a0510', '#150b22'],
        },
        {
          value: 'pink' as const,
          label: t('modernPink'),
          description: t('modernPinkDesc'),
          colors: ['#ea3392', '#1c0d15', '#2c1421'],
        },
      ] as const,
    [t],
  );

  const densityOptions = useMemo(
    () =>
      [
        { value: 'compact' as AppearanceDensity, label: t('compact'), description: t('compactDesc') },
        { value: 'comfortable' as AppearanceDensity, label: t('comfortable'), description: t('comfortableDesc') },
        { value: 'spacious' as AppearanceDensity, label: t('spacious'), description: t('spaciousDesc') },
      ] as const,
    [t],
  );

  const colorSwatchTitles = [t('accentHighlight'), t('baseCanvas'), t('secondaryBackground')] as const;

  const [prefs, setPrefs] = useState<AppearancePrefs>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (data) {
      setPrefs(data as AppearancePrefs);
    }
  }, [data]);

  const applyPrefs = useCallback(
    (next: AppearancePrefs) => {
      setTheme(next.theme);
      applyAppearanceToDocument(next);
    },
    [setTheme],
  );

  const updateTheme = (value: AppearanceTheme) => {
    const next = { ...prefs, theme: value };
    setPrefs(next);
    applyPrefs(next);
    saveAppearance({ url: APPEARANCE_URL, data: { theme: value } });
    if (value === 'system') {
      toast.success(t('systemThemeApplied'));
    } else {
      const label =
        colorThemeOptions.find((o) => o.value === value)?.label ??
        interfaceOptions.find((o) => o.value === value)?.label ??
        value;
      toast.success(t('themeApplied', { theme: label }));
    }
  };

  const updateDensity = (value: AppearanceDensity) => {
    const next = { ...prefs, density: value };
    setPrefs(next);
    applyPrefs(next);
    saveAppearance({ url: APPEARANCE_URL, data: { density: value } });
    const label = densityOptions.find((o) => o.value === value)?.label ?? value;
    toast.success(t('densitySet', { density: label }));
  };

  const selectedTheme = mounted ? ((activeTheme as AppearanceTheme) ?? prefs.theme) : prefs.theme;

  const isSystemActive = selectedTheme === 'system';
  const isLightActive = selectedTheme === 'light';
  const isDarkActive = selectedTheme !== 'system' && selectedTheme !== 'light';

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pageTitle')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('pageDescription')}</p>
      </div>

      <Section title={t('interfaceThemeTitle')} description={t('interfaceThemeDescription')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {interfaceOptions.map(({ value, label, description }) => {
            const isActive =
              (value === 'system' && isSystemActive) ||
              (value === 'light' && isLightActive) ||
              (value === 'dark' && isDarkActive);

            return (
              <button
                key={value}
                type="button"
                disabled={isLoading || !mounted}
                onClick={() => {
                  if (value === 'dark') {
                    const customThemes: AppearanceTheme[] = ['forest', 'cobalt', 'terracotta', 'quartz', 'pink'];
                    if (customThemes.includes(selectedTheme)) {
                      updateTheme(selectedTheme);
                    } else {
                      updateTheme('dark');
                    }
                  } else {
                    updateTheme(value);
                  }
                }}
                className={cn(
                  'group flex flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.01]'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40',
                )}
              >
                <div className="relative w-full aspect-[16/10] rounded-lg border border-border/50 overflow-hidden bg-background">
                  <div className="flex items-center gap-1.5 p-2 border-b border-border/40 bg-muted/30">
                    <span className="size-2 rounded-full bg-[#ff5f56] shrink-0" />
                    <span className="size-2 rounded-full bg-[#ffbd2e] shrink-0" />
                    <span className="size-2 rounded-full bg-[#27c93f] shrink-0" />
                    <span className="text-[9px] font-medium text-muted-foreground/60 font-mono ml-2 select-none">
                      {t('yourDashboard')}
                    </span>
                  </div>

                  {value === 'light' && (
                    <div className="flex h-full bg-[#faf7f2]">
                      <div className="w-1/4 border-r border-[#ece6db] p-2 bg-[#f4ebd9]/30 flex flex-col gap-2">
                        <div className="size-4 rounded-full bg-[#ddd5c7]" />
                        <div className="flex flex-col gap-1">
                          <div className="h-1.5 w-full rounded bg-[#ddd5c7]" />
                          <div className="h-1.5 w-4/5 rounded bg-[#ddd5c7]" />
                          <div className="h-1.5 w-3/5 rounded bg-[#ddd5c7]" />
                        </div>
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-2 bg-[#faf7f2]">
                        <div className="h-3 w-16 rounded bg-[#ddd5c7]/60" />
                        <div className="flex-1 border border-[#ece6db] rounded p-2 bg-white flex flex-col gap-1.5 shadow-sm">
                          <div className="h-2 w-20 rounded bg-[#ddd5c7]" />
                          <div className="h-1.5 w-12 rounded bg-[#eee7db]" />
                          <div className="h-3.5 w-14 rounded-sm bg-[#3b82f6]/90 mt-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  {value === 'dark' && (
                    <div className="flex h-full bg-[#0f0f10]">
                      <div className="w-1/4 border-r border-neutral-800 p-2 bg-neutral-900/50 flex flex-col gap-2">
                        <div className="size-4 rounded-full bg-neutral-800" />
                        <div className="flex flex-col gap-1">
                          <div className="h-1.5 w-full rounded bg-neutral-800" />
                          <div className="h-1.5 w-4/5 rounded bg-neutral-800" />
                          <div className="h-1.5 w-3/5 rounded bg-neutral-800" />
                        </div>
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-2 bg-[#0f0f10]">
                        <div className="h-3 w-16 rounded bg-neutral-800/60" />
                        <div className="flex-1 border border-neutral-800 rounded p-2 bg-neutral-900 flex flex-col gap-1.5 shadow-sm">
                          <div className="h-2 w-20 rounded bg-neutral-800" />
                          <div className="h-1.5 w-12 rounded bg-neutral-800/60" />
                          <div className="h-3.5 w-14 rounded-sm bg-[#2563eb]/90 mt-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  {value === 'system' && (
                    <div className="flex h-full">
                      <div className="w-1/2 flex border-r border-border/30 bg-[#faf7f2]">
                        <div className="w-1/3 border-r border-[#ece6db] p-2 bg-[#f4ebd9]/30 flex flex-col gap-2">
                          <div className="size-3.5 rounded-full bg-[#ddd5c7]" />
                          <div className="h-1 w-full rounded bg-[#ddd5c7]" />
                          <div className="h-1 w-2/3 rounded bg-[#ddd5c7]" />
                        </div>
                        <div className="flex-1 p-2 flex flex-col gap-1.5 bg-[#faf7f2]">
                          <div className="h-2 w-10 rounded bg-[#ddd5c7]/60" />
                          <div className="flex-1 border border-[#ece6db] rounded-sm p-1.5 bg-white flex flex-col gap-1 shadow-sm">
                            <div className="h-1.5 w-12 rounded bg-[#ddd5c7]" />
                            <div className="h-3 w-8 rounded-sm bg-[#3b82f6]/90 mt-1" />
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2 flex bg-[#0f0f10]">
                        <div className="w-1/3 border-r border-neutral-800 p-2 bg-neutral-900/50 flex flex-col gap-2">
                          <div className="size-3.5 rounded-full bg-neutral-800" />
                          <div className="h-1 w-full rounded bg-neutral-800" />
                          <div className="h-1 w-2/3 rounded bg-neutral-800" />
                        </div>
                        <div className="flex-1 p-2 flex flex-col gap-1.5 bg-[#0f0f10]">
                          <div className="h-2 w-10 rounded bg-neutral-800/60" />
                          <div className="flex-1 border border-neutral-800 rounded-sm p-1.5 bg-neutral-900 flex flex-col gap-1 shadow-sm">
                            <div className="h-1.5 w-12 rounded bg-neutral-800" />
                            <div className="h-3 w-8 rounded-sm bg-[#2563eb]/90 mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute bottom-2 left-2 size-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md animate-in zoom-in-50 duration-200">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <div className="font-semibold text-foreground text-xs leading-none">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('colorThemeTitle')} description={t('colorThemeDescription')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {colorThemeOptions.map(({ value, label, description, colors }) => {
            const isChecked = selectedTheme === value;

            return (
              <button
                key={value}
                type="button"
                disabled={isLoading || !mounted}
                onClick={() => updateTheme(value)}
                className={cn(
                  'group flex flex-col gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 relative overflow-hidden',
                  isChecked
                    ? 'border-emerald-500/80 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40',
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <div className="font-semibold text-foreground text-sm tracking-tight">{label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
                  </div>

                  <div
                    className={cn(
                      'size-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5',
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-border bg-background group-hover:border-primary/40',
                    )}
                  >
                    {isChecked && <Check className="size-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex gap-1.5 mt-auto pt-2">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="h-5.5 w-11 rounded-md border border-border/10 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={colorSwatchTitles[idx]}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('densityTitle')} description={t('densityDescription')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {densityOptions.map(({ value, label, description }) => {
            const isSelected = prefs.density === value;

            return (
              <button
                key={value}
                type="button"
                disabled={isLoading || !mounted}
                onClick={() => updateDensity(value)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.01]'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40',
                )}
              >
                <div className="font-semibold text-sm text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</div>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
