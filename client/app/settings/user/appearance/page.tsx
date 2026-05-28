'use client';

import { useCallback, useEffect, useState } from 'react';
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

const APPEARANCE_URL = '/user/self/appearance/';

// Interface Theme option definitions
const INTERFACE_OPTIONS = [
  {
    value: 'system' as const,
    label: 'System preference',
    description: 'Follows your OS appearance settings.',
  },
  {
    value: 'light' as const,
    label: 'Light',
    description: 'Clean, architectural canvas base.',
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    description: 'Classic charcoal dark theme.',
  },
];

// Custom Color Theme option definitions
const COLOR_THEME_OPTIONS = [
  {
    value: 'forest' as const,
    label: 'Default Green',
    description: 'Fresh green theme',
    colors: ['#10b981', '#040906', '#121e15'], // Primary Accent, Dark Background, Muted Card
  },
  {
    value: 'cobalt' as const,
    label: 'Blue',
    description: 'Professional blue theme',
    colors: ['#2563eb', '#050a14', '#0f182c'],
  },
  {
    value: 'terracotta' as const,
    label: 'Vibrant Orange',
    description: 'Energetic Orange theme',
    colors: ['#e07a57', '#120c09', '#1f1612'],
  },
  {
    value: 'quartz' as const,
    label: 'Royal Purple',
    description: 'Elegant Purple theme',
    colors: ['#db2777', '#0a0510', '#150b22'],
  },
  {
    value: 'pink' as const,
    label: 'Modern Pink',
    description: 'Contemporary pink theme',
    colors: ['#ea3392', '#1c0d15', '#2c1421'],
  },
];

const DENSITY_OPTIONS: { value: AppearanceDensity; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'More content on screen' },
  { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
  { value: 'spacious', label: 'Spacious', description: 'Extra breathing room' },
];

export default function UserAppearancePage() {
  const queryClient = useQueryClient();
  const { theme: activeTheme, setTheme } = useTheme();
  const { data, isLoading } = useFetch(APPEARANCE_URL);
  const { mutate: saveAppearance } = usePatch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPEARANCE_URL] });
    },
    onError: () => toast.error('Failed to sync settings.'),
  });

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
    [setTheme]
  );

  const updateTheme = (value: AppearanceTheme) => {
    const next = { ...prefs, theme: value };
    setPrefs(next);
    applyPrefs(next);
    saveAppearance({ url: APPEARANCE_URL, data: { theme: value } });
    toast.success(`${value === 'system' ? 'System theme' : value.charAt(0).toUpperCase() + value.slice(1) + ' theme'} applied.`);
  };

  const updateDensity = (value: AppearanceDensity) => {
    const next = { ...prefs, density: value };
    setPrefs(next);
    applyPrefs(next);
    saveAppearance({ url: APPEARANCE_URL, data: { density: value } });
    toast.success(`${value.charAt(0).toUpperCase() + value.slice(1)} density set.`);
  };

  const selectedTheme = mounted ? (activeTheme as AppearanceTheme) ?? prefs.theme : prefs.theme;

  // Determine standard interface selected state
  const isSystemActive = selectedTheme === 'system';
  const isLightActive = selectedTheme === 'light';
  // "Dark" is highlighted if it's either classic 'dark' or any custom dark theme
  const isDarkActive = selectedTheme !== 'system' && selectedTheme !== 'light';

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Appearance Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the look and feel of your application. All changes apply and sync instantly.
        </p>
      </div>

      {/* Interface Theme Section */}
      <Section title="Interface theme" description="Select or customize your UI theme.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {INTERFACE_OPTIONS.map(({ value, label, description }) => {
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
                    // Clicking Dark sets to classic 'dark' unless a custom theme is already running
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
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40'
                )}
              >
                {/* Visual Mac Window Mockup */}
                <div className="relative w-full aspect-[16/10] rounded-lg border border-border/50 overflow-hidden bg-background">
                  {/* Title Bar */}
                  <div className="flex items-center gap-1.5 p-2 border-b border-border/40 bg-muted/30">
                    <span className="size-2 rounded-full bg-[#ff5f56] shrink-0" />
                    <span className="size-2 rounded-full bg-[#ffbd2e] shrink-0" />
                    <span className="size-2 rounded-full bg-[#27c93f] shrink-0" />
                    <span className="text-[9px] font-medium text-muted-foreground/60 font-mono ml-2 select-none">
                      Your dashboard
                    </span>
                  </div>

                  {/* Render the specific mode styling */}
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
                      {/* Left Half (Light Mode) */}
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
                      {/* Right Half (Dark Mode) */}
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

                  {/* Mockup selected check badge in the bottom-left */}
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

      {/* Color Theme Section */}
      <Section title="Color Theme" description="Select a color scheme for your platform">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {COLOR_THEME_OPTIONS.map(({ value, label, description, colors }) => {
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
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40'
                )}
              >
                {/* Header block inside card */}
                <div className="flex items-start justify-between w-full">
                  <div>
                    <div className="font-semibold text-foreground text-sm tracking-tight">{label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
                  </div>

                  {/* Checked Checkbox Indicator */}
                  <div
                    className={cn(
                      'size-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5',
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-border bg-background group-hover:border-primary/40'
                    )}
                  >
                    {isChecked && <Check className="size-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Color pills on bottom */}
                <div className="flex gap-1.5 mt-auto pt-2">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="h-5.5 w-11 rounded-md border border-border/10 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={idx === 0 ? 'Accent Highlight' : idx === 1 ? 'Base Canvas' : 'Secondary Background'}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Density Section */}
      <Section title="Density" description="Adjust spacing and base font size across the app.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {DENSITY_OPTIONS.map(({ value, label, description }) => {
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
                    : 'border-border/60 bg-card hover:border-primary/30 hover:bg-accent/40'
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
