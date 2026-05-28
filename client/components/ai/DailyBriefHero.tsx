'use client'

import { useState, useEffect } from 'react';
import { RefreshCw, Sun, Cloud, CloudRain, CloudSnow, Wind, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DailyBrief } from '@/lib/ai/types';
import Link from 'next/link';

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

// Typing effect component for AI-generated content
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
    <span className="text-foreground/95">
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-primary ml-1.5 animate-pulse" />}
    </span>
  );
}

// Weather icon component
function WeatherIcon({ condition }: { condition: string }) {
  const iconClass = "w-5 h-5 text-muted-foreground";

  switch (condition) {
    case 'sunny':
      return <Sun className={`${iconClass} text-amber-500`} />;
    case 'cloudy':
      return <Cloud className={iconClass} />;
    case 'rainy':
      return <CloudRain className={`${iconClass} text-blue-500`} />;
    case 'snowy':
      return <CloudSnow className={`${iconClass} text-blue-300`} />;
    case 'windy':
      return <Wind className={iconClass} />;
    default:
      return <Sun className={`${iconClass} text-amber-500`} />;
  }
}

// Parse brief content to add links where applicable
function BriefContent({ content }: { content: string }) {
  const linkPatterns = [
    { pattern: /(Hampstead|Chelsea|Notting Hill|Kensington|Mayfair|project)\s*(project|house|penthouse)?/gi, href: '/projects', label: 'View Project' },
    { pattern: /(quote|approval|approve|invoice|purchase order|PO)/gi, href: '/home/tasks', label: 'View Tasks' },
    { pattern: /(email|inbox|message from|reply to)/gi, href: '/ai/inbox', label: 'View Inbox' },
    { pattern: /(meeting|calendar|schedule|appointment)/gi, href: '/home/calendar', label: 'View Calendar' },
    { pattern: /(supplier|vendor|contractor)/gi, href: '/crm/contacts', label: 'View CRM' },
  ];

  const paragraphs = content?.split('\n\n');

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      {paragraphs.map((paragraph, i) => {
        const elements: (string | JSX.Element)[] = [];
        let lastIndex = 0;

        const matches: { index: number; length: number; text: string; href: string }[] = [];

        linkPatterns.forEach(({ pattern, href }) => {
          const regex = new RegExp(pattern.source, pattern.flags);
          let match;
          while ((match = regex.exec(paragraph)) !== null) {
            matches.push({
              index: match.index,
              length: match[0].length,
              text: match[0],
              href,
            });
          }
        });

        matches.sort((a, b) => a.index - b.index);

        const uniqueMatches = matches.filter((match, idx) => {
          if (idx === 0) return true;
          const prev = matches[idx - 1];
          return match.index >= prev.index + prev.length;
        });

        uniqueMatches.forEach((match, idx) => {
          if (match.index > lastIndex) {
            elements.push(paragraph.substring(lastIndex, match.index));
          }

          elements.push(
            <Link
              key={`${i}-${idx}`}
              href={match.href}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors font-semibold"
            >
              {match.text}
            </Link>
          );

          lastIndex = match.index + match.length;
        });

        if (lastIndex < paragraph.length) {
          elements.push(paragraph.substring(lastIndex));
        }

        if (uniqueMatches.length === 0) {
          elements.push(paragraph);
        }

        return (
          <p
            key={i}
            className="text-foreground/90 leading-relaxed mb-3.5 last:mb-0 text-sm font-medium"
          >
            {elements}
          </p>
        );
      })}
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
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        {/* Outer decorative gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/40 via-primary/10 to-accent/20 p-[1.5px]">
          <div className="h-full w-full rounded-2xl bg-card" />
        </div>

        {/* Content */}
        <div className="relative p-6 animate-pulse space-y-4">
          <div className="h-7 bg-muted rounded w-64 mb-1" />
          <div className="h-4 bg-muted rounded w-32 mb-4" />
          <div className="space-y-2.5">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-[92%]" />
            <div className="h-4 bg-muted rounded w-[78%]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm">
      {/* Outer decorative dynamic theme-primary gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/40 via-primary/10 to-accent/25 p-[1.5px]">
        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-primary/[0.03] via-card to-accent/[0.02]" />
      </div>

      {/* Inner content */}
      <div className="relative p-5 sm:p-6">
        {/* Header: Greeting + Date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {greeting}
            </span>
            , {userName} <WeatherIcon condition={weather.condition} />
          </h1>
          <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
            {date}
          </span>
        </div>

        {/* Daily Brief Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground/80 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" /> Daily Brief
            </span>

            {onRegenerate && (
              <Button
                onClick={onRegenerate}
                disabled={isRegenerating}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl px-2.5 py-1 transition-all"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1.5 animate-spin text-primary" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Refresh
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Brief Content Card - premium glassmorphism */}
          {isRegenerating ? (
            <div className="relative rounded-xl overflow-hidden border border-border/30 bg-card/65 backdrop-blur-md p-5 animate-pulse">
              <div className="space-y-2.5">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-[90%]" />
                <div className="h-4 bg-muted rounded w-[75%]" />
              </div>
            </div>
          ) : brief ? (
            <div className="relative rounded-xl overflow-hidden border border-border/40 bg-gradient-to-r from-primary/[0.03] to-primary/[0.01] backdrop-blur-md p-5 shadow-sm text-foreground/90 leading-relaxed text-sm font-medium">
              <TypingEffect text={typeof brief === 'string' ? brief : brief?.content || ''} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-border/30 bg-card/65 backdrop-blur-md p-6 text-center shadow-sm">
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed font-semibold">
                Your personalised brief will appear here
              </p>
              {onRegenerate && (
                <Button
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-semibold shadow-sm px-4"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Brief'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}