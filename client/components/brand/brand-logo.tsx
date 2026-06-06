'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
};

/** Matches app sidebar: one Logo.png asset with theme-aware blend filters. */
export function BrandLogo({
  className,
  iconClassName,
  showWordmark = false,
  wordmarkClassName,
  size = 28,
}: BrandLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  const isDarkLogo =
    hasMounted &&
    theme !== 'light' &&
    (theme === 'dark' || theme === 'system' ? resolvedTheme === 'dark' : true);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/brand/Logo.png"
        alt="Focuspilot"
        width={size}
        height={size}
        className={cn(
          'object-contain',
          isDarkLogo ? 'invert mix-blend-screen' : 'mix-blend-multiply',
          iconClassName,
        )}
        style={{ width: size, height: size }}
      />
      {showWordmark ? (
        <span className={cn('text-lg font-semibold text-foreground', wordmarkClassName)}>
          Focuspilot
        </span>
      ) : null}
    </div>
  );
}
