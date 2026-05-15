'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import { RefreshCw, Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
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
    <span>
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-stone-400 ml-0.5 animate-pulse" />}
    </span>
  );
}


// Weather icon component
function WeatherIcon({ condition }: { condition: string }) {
  const iconClass = "w-5 h-5 text-neutral-500";

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
  // Pattern to detect project names, task references, etc.
  // This parses content and creates links for:
  // - Project names (e.g., "Hampstead Project" -> /projects)
  // - Tasks (e.g., "approve the quote" -> /home/tasks)
  // - Emails/inbox references -> /ai/inbox
  // - Calendar/meeting references -> /home/calendar

  const linkPatterns = [
    { pattern: /(Hampstead|Chelsea|Notting Hill|Kensington|Mayfair|project)\s*(project|house|penthouse)?/gi, href: '/projects', label: 'View Project' },
    { pattern: /(quote|approval|approve|invoice|purchase order|PO)/gi, href: '/home/tasks', label: 'View Tasks' },
    { pattern: /(email|inbox|message from|reply to)/gi, href: '/ai/inbox', label: 'View Inbox' },
    { pattern: /(meeting|calendar|schedule|appointment)/gi, href: '/home/calendar', label: 'View Calendar' },
    { pattern: /(supplier|vendor|contractor)/gi, href: '/crm/contacts', label: 'View CRM' },
  ];

  // Simple implementation: parse and wrap matched terms in links
  const paragraphs = content?.split('\n\n');

  return (
    <div className="prose prose-neutral max-w-none">
      {paragraphs.map((paragraph, i) => {
        let processedText = paragraph;
        const elements: (string | JSX.Element)[] = [];
        let lastIndex = 0;

        // Find all matches and their positions
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

        // Sort matches by position
        matches.sort((a, b) => a.index - b.index);

        // Remove overlapping matches (keep first one)
        const uniqueMatches = matches.filter((match, idx) => {
          if (idx === 0) return true;
          const prev = matches[idx - 1];
          return match.index >= prev.index + prev.length;
        });

        // Build elements array
        uniqueMatches.forEach((match, idx) => {
          // Add text before this match
          if (match.index > lastIndex) {
            elements.push(paragraph.substring(lastIndex, match.index));
          }

          // Add the linked text
          elements.push(
            <Link
              key={`${i}-${idx}`}
              href={match.href}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {match.text}
            </Link>
          );

          lastIndex = match.index + match.length;
        });

        // Add remaining text
        if (lastIndex < paragraph.length) {
          elements.push(paragraph.substring(lastIndex));
        }

        // If no matches, just render the paragraph
        if (uniqueMatches.length === 0) {
          elements.push(paragraph);
        }

        return (
          <p
            key={i}
            className="text-neutral-800 leading-relaxed mb-3 last:mb-0 text-sm"
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
  weather = { condition: 'sunny' }, // Default to sunny, will be replaced with actual weather API
}: DailyBriefHeroProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        {/* Outer decorative border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sage-200/60 via-clay-200/40 to-ochre-200/50 p-[2px]">
          <div className="h-full w-full rounded-2xl bg-gradient-to-br from-neutral-50 via-sage-50/30 to-clay-50/20" />
        </div>

        {/* Content */}
        <div className="relative p-6 animate-pulse">
          <div className="h-8 bg-white rounded w-64 mb-2" />
          <div className="h-4 bg-white rounded w-32 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-white rounded w-full" />
            <div className="h-4 bg-white rounded w-5/6" />
            <div className="h-4 bg-white rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Outer decorative gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sage-300/70 via-clay-300/50 to-ochre-300/60 p-[2px]">
        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-neutral-50 via-sage-50/30 to-clay-50/20" />
      </div>

      {/* Inner content with subtle shadow */}
      <div className="relative p-6">
        {/* Header: Greeting + Date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            {greeting}, {userName} <WeatherIcon condition={weather.condition} />
          </h1>
          <span className="text-sm text-neutral-600 font-medium">
            {date}
          </span>
        </div>

        {/* Daily Brief Section */}
        <div className="space-y-3">
          {/* Label - simple text, no AI icon */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Daily Brief</span>

            {onRegenerate && (
              <Button
                onClick={onRegenerate}
                disabled={isRegenerating}
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
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

          {/* Brief Content Card - with double border effect */}
          {isRegenerating ? (
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-neutral-200/80 shadow-sm" />
              <div className="absolute inset-[3px] rounded-lg ring-1 ring-inset ring-neutral-100/60" />
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-5 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-white rounded w-full" />
                  <div className="h-4 bg-white rounded w-5/6" />
                  <div className="h-4 bg-white rounded w-4/6" />
                </div>
              </div>
            </div>
          ) : brief ? (
            <div className="relative rounded-xl overflow-hidden">
              {/* Decorative inner border */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-neutral-200/80 shadow-sm" />
              <div className="absolute inset-[3px] rounded-lg ring-1 ring-inset ring-neutral-100/60" />

              {/* Content */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-5 text-neutral-800 leading-relaxed text-sm">
                <TypingEffect text={typeof brief === 'string' ? brief : brief?.content || ''} />
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {/* Decorative border for empty state */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-neutral-200/80" />
              <div className="absolute inset-[3px] rounded-lg ring-1 ring-inset ring-neutral-100/60" />

              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-neutral-600 text-sm mb-3">
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
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Brief'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}