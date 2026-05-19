import React from 'react';
import Link from 'next/link';
import { ExternalLink, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { IntegrationCard } from './IntegrationCard';

type Props = {
  isConfigured: boolean;
  isLoading: boolean;
};

const ZapierIntegration = ({ isConfigured, isLoading }: Props) => {
  return (
    <IntegrationCard
      icon={<Zap className="h-4 w-4 text-amber-500" />}
      title="Zapier & API"
      description="Create API keys and webhooks to connect Focuspilot with Zapier, Make, or your own scripts."
      isLoading={isLoading}
      status={isConfigured ? 'configured' : null}
      footer={
        <Button size="sm" asChild>
          <Link href="/settings/studio/api">
            {isConfigured ? 'Manage API & webhooks' : 'Set up API & webhooks'}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Link>
        </Button>
      }
    />
  );
};

export default ZapierIntegration;
