'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import usePatch from '@/hooks/usePatch';
import useUser from '@/hooks/useUser';
import type { AppearanceTheme } from '@/lib/appearance';
import { cn } from '@/lib/utils';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const APPEARANCE_URL = '/user/self/appearance/';

const OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useUser();
  const { mutate: patchAppearance } = usePatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const applyTheme = (value: AppearanceTheme) => {
    setTheme(value);
    if (user?.email) {
      patchAppearance({ url: APPEARANCE_URL, data: { theme: value } });
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-8', className)}
        aria-label="Theme"
        disabled
      />
    );
  }

  const active = theme ?? 'system';
  const ResolvedIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-8 text-muted-foreground hover:text-foreground', className)}
          aria-label="Toggle theme"
        >
          <ResolvedIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => applyTheme(value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {active === value && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
