'use client'

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DailyBrief } from '@/lib/ai/types';

interface DailyBriefCardProps {
  brief: DailyBrief;
  compact?: boolean;
}

export function DailyBriefCard({ brief, compact = false }: DailyBriefCardProps) {
  // Extract first paragraph for preview
  const firstParagraph = brief.content.split('\n\n')[0];
  const hasMore = brief.content.split('\n\n').length > 1;

  if (compact) {
    return (
      <Link href="/ai/daily-brief">
        <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Your Daily Brief</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {firstParagraph}
              </p>
              {hasMore && (
                <p className="text-xs text-primary mt-2">Read more →</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Your Daily Brief</h2>
      </div>

      <div className="prose prose-sm max-w-none mb-4">
        {brief.content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0 text-foreground">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Generated {new Date(brief.generated_at).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <Link href="/ai/daily-brief">
          <Button variant="ghost" size="sm">
            View full brief
          </Button>
        </Link>
      </div>
    </div>
  );
}