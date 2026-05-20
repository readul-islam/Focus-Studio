'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DailyBrief } from '@/lib/ai/types';
import { cn } from '@/lib/utils';

interface DailyBriefHeroProps {
  brief: DailyBrief | null;
  userName: string;
  greeting: string;
  date: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  isLoading?: boolean;
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
    temp?: number;
  };
}

function TypingEffect({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    if (!text) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p>
      {displayedText}
      {!isComplete && <span className="animate-pulse text-muted-foreground">|</span>}
    </p>
  );
}

function WeatherIcon({ condition }: { condition: DailyBriefHeroProps['weather']['condition'] }) {
  const iconClass = 'w-5 h-5 text-muted-foreground';
  switch (condition) {
    case 'sunny':
      return <Sun className={cn(iconClass, 'text-[#715A5A] dark:text-[#D3DAD9]')} />;
    case 'cloudy':
      return <Cloud className={iconClass} />;
    case 'rainy':
      return <CloudRain className={iconClass} />;
    case 'snowy':
      return <CloudSnow className={iconClass} />;
    case 'windy':
      return <Wind className={iconClass} />;
    default:
      return <Sun className={cn(iconClass, 'text-[#715A5A] dark:text-[#D3DAD9]')} />;
  }
}

function BriefContentPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'daily-brief-hero__panel rounded-xl border p-5 text-foreground leading-relaxed text-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

function HeroShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('daily-brief-hero relative overflow-hidden rounded-2xl', className)}>
      <div className="daily-brief-hero__glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative p-6">{children}</div>
    </div>
  );
}

export function DailyBriefHero({
  brief,
  userName,
  greeting,
  date,
  onRegenerate,
  isRegenerating = false,
  isLoading = false,
  weather = { condition: 'sunny' },
}: DailyBriefHeroProps) {
  if (isLoading) {
    return (
      <HeroShell className="animate-pulse">
        <div className="mb-5 h-8 w-64 rounded bg-muted/60" />
        <div className="mb-6 h-4 w-32 rounded bg-muted/50" />
        <div className="daily-brief-hero__panel space-y-3 rounded-xl p-5">
          <div className="h-4 w-full rounded bg-muted/50" />
          <div className="h-4 w-5/6 rounded bg-muted/50" />
          <div className="h-4 w-4/6 rounded bg-muted/50" />
        </div>
      </HeroShell>
    );
  }

  return (
    <HeroShell>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground md:text-2xl">
          {greeting}, {userName} <WeatherIcon condition={weather.condition} />
        </h1>
        <span className="text-sm font-medium text-muted-foreground">{date}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Daily Brief</span>
          {onRegenerate && (
            <Button
              onClick={onRegenerate}
              disabled={isRegenerating}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                  Refresh
                </>
              )}
            </Button>
          )}
        </div>

        {isRegenerating ? (
          <BriefContentPanel className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-muted/50" />
              <div className="h-4 w-5/6 rounded bg-muted/50" />
              <div className="h-4 w-4/6 rounded bg-muted/50" />
            </div>
          </BriefContentPanel>
        ) : brief ? (
          <BriefContentPanel>
            <TypingEffect text={typeof brief === 'string' ? brief : brief?.content || ''} />
          </BriefContentPanel>
        ) : (
          <BriefContentPanel className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Your personalised brief will appear here
            </p>
            {onRegenerate && (
              <Button
                onClick={onRegenerate}
                disabled={isRegenerating}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Brief'
                )}
              </Button>
            )}
          </BriefContentPanel>
        )}
      </div>
    </HeroShell>
  );
}

