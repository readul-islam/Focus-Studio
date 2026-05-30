'use client';

import { useEffect, useState } from 'react';
import { getLatestBrief, generateDailyBrief } from './actions';
import { Button } from '@/components/ui/button';
import { gooeyToast as toast } from 'goey-toast';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { DailyBrief } from '@/lib/ai/types';
import { useTranslations } from 'next-intl';

export default function DailyBriefPage() {
  const t = useTranslations('dailyBriefPage');
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadBrief();
  }, []);

  async function loadBrief() {
    setLoading(true);
    const result = await getLatestBrief();
    if (result.success && result.data) {
      setBrief(result.data);
    } else if (result.error) {
      console.error('Failed to load brief:', result.error);
    }
    setLoading(false);
  }

  async function regenerate() {
    setRegenerating(true);
    const result = await generateDailyBrief();
    if (result.success && result.data) {
      setBrief(result.data);
      toast.success(t('toasts.regenerated'));
    } else {
      toast.error(result.error || t('toasts.failed'));
    }
    setRegenerating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
          <p className="text-muted-foreground mb-6">{t('emptySubtitle')}</p>
          <Button onClick={regenerate} disabled={regenerating}>
            {regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('generateNow')}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('generatedAt', {
              date: new Date(brief.generated_at).toLocaleString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </p>
        </div>
        <Button onClick={regenerate} disabled={regenerating} variant="outline" size="sm">
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('regenerating')}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('regenerate')}
            </>
          )}
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="prose prose-lg max-w-none">
          {brief.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4 last:mb-0 leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground text-center">
        <Sparkles className="inline h-3 w-3 mr-1" />
        {t('poweredBy')}
      </div>
    </div>
  );
}
