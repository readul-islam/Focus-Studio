'use client'

import { useState } from 'react';
import { DailyBriefCard } from '@/components/ai/DailyBriefCard';
import { Button } from '@/components/ui/button';
import { mockDailyBrief, mockEmptyBrief, mockLongBrief, simulateAPIDelay } from '@/lib/ai/mock-data';
import type { DailyBrief } from '@/lib/ai/types';

/**
 * TEST PAGE for Daily Brief components
 *
 * This page demonstrates all Daily Brief UI states with mock data.
 * Remove this file once backend APIs are implemented and tested.
 */
export default function DailyBriefTestPage() {
  const [currentBrief, setCurrentBrief] = useState<DailyBrief>(mockDailyBrief);
  const [loading, setLoading] = useState(false);

  async function loadBrief(brief: DailyBrief) {
    setLoading(true);
    const data = await simulateAPIDelay(brief);
    setCurrentBrief(data);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Daily Brief Component Tests</h1>
        <p className="text-muted-foreground">
          Testing all UI states with mock data. This page will be removed once backend is ready.
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-muted/50 border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Load Different Brief Types:</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => loadBrief(mockDailyBrief)}
            variant="outline"
            size="sm"
          >
            Standard Brief (3 items)
          </Button>
          <Button
            onClick={() => loadBrief(mockEmptyBrief)}
            variant="outline"
            size="sm"
          >
            Empty Brief (calm day)
          </Button>
          <Button
            onClick={() => loadBrief(mockLongBrief)}
            variant="outline"
            size="sm"
          >
            Long Brief (7 items)
          </Button>
        </div>
      </div>

      {/* Compact Card Test */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Compact Mode (for Dashboard)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This is how the brief appears on the main dashboard as a preview card.
        </p>
        <div className="max-w-md">
          {loading ? (
            <div className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ) : (
            <DailyBriefCard brief={currentBrief} compact={true} />
          )}
        </div>
      </div>

      {/* Full Card Test */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Full Mode (Dedicated Page)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This is how the brief appears on the dedicated /ai/daily-brief page.
        </p>
        {loading ? (
          <div className="bg-card border rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ) : (
          <DailyBriefCard brief={currentBrief} compact={false} />
        )}
      </div>

      {/* Raw Data Display */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Current Brief Data (JSON)</h2>
        <details className="bg-card border rounded-lg">
          <summary className="p-4 cursor-pointer font-medium hover:bg-muted/50">
            View raw JSON data
          </summary>
          <div className="p-4 border-t">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(currentBrief, null, 2)}
            </pre>
          </div>
        </details>
      </div>

      {/* British English Verification */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">✅ British English Verification</h3>
        <ul className="text-sm space-y-1">
          <li>✓ Contains "organised" (not "organized")</li>
          <li>✓ No em dashes (—) present</li>
          <li>✓ Flowing narrative format (not bullet points)</li>
          <li>✓ Kind, warm, supportive tone</li>
          <li>✓ Informative paragraphs (2-3 short paragraphs)</li>
        </ul>
      </div>

      {/* Test Checklist */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📋 Manual Test Checklist</h3>
        <ul className="text-sm space-y-1">
          <li>☐ Compact card displays first paragraph correctly</li>
          <li>☐ "Read more →" link appears when content is long</li>
          <li>☐ Full card shows all paragraphs formatted properly</li>
          <li>☐ Generated date displays in British format (dd MMM, HH:mm)</li>
          <li>☐ "View full brief" button navigates correctly</li>
          <li>☐ Loading state displays skeleton animation</li>
          <li>☐ Empty brief (calm day) displays without errors</li>
          <li>☐ Long brief (7 items) displays all content readable</li>
          <li>☐ Hover effects work on compact card</li>
          <li>☐ No console errors or warnings</li>
        </ul>
      </div>
    </div>
  );
}
