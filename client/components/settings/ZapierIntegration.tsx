import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
  isConfigured: boolean;
  isLoading: boolean;
};

const ZapierIntegration = ({ isConfigured, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-16 rounded bg-stone-200 mb-2" />
        <div className="h-3 w-48 rounded bg-stone-100 mb-5" />
        <div className="h-8 w-28 rounded bg-stone-200" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-5 ${
        isConfigured ? 'border-gray-200 bg-white' : 'border-gray-200 bg-stone-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Zapier & API
        </span>
        {isConfigured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3" />
            Configured
          </span>
        ) : null}
      </div>
      <p className="text-xs text-stone-500 mb-4">
        Create API keys and webhooks to connect Focuspilot with Zapier, Make, or your own scripts.
      </p>
      <Button size="sm" asChild>
        <Link href="/settings/studio/api">
          {isConfigured ? 'Manage API & webhooks' : 'Set up API & webhooks'}
          <ExternalLink className="ml-1.5 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
};

export default ZapierIntegration;
